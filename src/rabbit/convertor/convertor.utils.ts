/**
 * Convertor Logic — Ecosystem → UI Event Conversion
 *
 * Main entry point: convertEcosystemEvent(rawEvent)
 *
 * Flow:
 *   1. Parse:   validate raw event with ecosystemEventSchema (Zod discriminated union)
 *               → typed { eventName, data }
 *   2. Match:   find the EventConfig in CONVERTOR_MAP by eventName
 *   3. Enrich:  call enrich(data) to fetch additional fields (http, may fail → {})
 *   4. Resolve: build destination values by merging:
 *               - staticValues:  fixed params from config (e.g. { category: 'failure', active: true })
 *               - dynamicValues: params extracted from parsed event data + enriched data
 *   5. Meta:    call getMeta(destValues) to build message metadata (e.g. notification title)
 *   6. Format:  for each destination config, produce a Publication:
 *               - topic exchange:   routingKey = formatted topic string, headers = meta
 *               - headers exchange: routingKey = '', headers = routing headers + meta
 *
 * Returns Publication[] — one per destination (currently 2: topic + headers exchange).
 */
import { ecosystemEventSchema } from '../ecosystem/ecosystem.schemas.ts'
import { CONVERTOR_MAP } from './convertor.config.ts'
import { EXCHANGE_TYPES, EXCHANGES } from '../rabbit/rabbit.consts.ts'
import { ECOSYSTEM_TOPIC_SOURCES } from '../ecosystem/ecosystem.consts.ts'
import { formatTopic, formatHeaders } from '../rabbit/rabbit.utils.ts'


// ──── Config Lookup ────

const {
  [EXCHANGES.ECOSYSTEM_TOPICS]: { [ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM]: eventConfigs },
} = CONVERTOR_MAP

const findEventConfig = (eventName: string) => {
  const config = eventConfigs.find(({ eventName: configEventName }) => configEventName === eventName)

  if (!config) {
    throw new Error(`No conversion config for event: ${eventName}`)
  }

  return config
}

// ──── Enrichment ────

const emptyResult = <Result extends Record<string, unknown>>(): Partial<Result> => ({})

const applyEnrichData = async <
  Data extends Record<string, string>,
  EnrichResult extends Record<string, unknown> = Record<string, never>,
>(
  data: Data,
  enrich?: (data: Data) => Promise<EnrichResult>,
) => enrich ? enrich(data).catch(emptyResult<EnrichResult>) : emptyResult<EnrichResult>()

// ──── Field Renaming ────

const renameEventDataFields = <
  DynamicValues extends Partial<Record<string, string>>,
  Data extends Record<string, unknown>,
>(
  dynamicValues: DynamicValues,
  data: Data,
) =>
  Object.fromEntries(
    Object.entries(dynamicValues)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
      .map(([destParam, dataKey]) => [destParam, String(data[dataKey] ?? '')]),
  )

// ──── Main Conversion ────
interface Publication {
  exchange: string
  routingKey: string
  headers: Record<string, unknown>
  content: Record<string, unknown>
}

function publish(_publication: Publication) {
  // todo
}

export const convertEcosystemEvent = async (rawEvent: unknown) => {
  const { eventName, data } = ecosystemEventSchema.parse(rawEvent)
  const config = findEventConfig(eventName)
  const { getMeta, enrich, dynamicValues, staticValues, destinations } = config
  const enrichedData = await applyEnrichData(data, enrich)
  const fullData = { ...data, ...enrichedData }
  const renamedFields = renameEventDataFields(dynamicValues, fullData)
  const destValues = ({ ...staticValues, ...renamedFields })
  const meta = getMeta(destValues)
  return destinations.map((destination) => {
    const { exchange, exchangeType } = destination
    if (exchangeType === EXCHANGE_TYPES.TOPIC) {
      return publish({
        exchange,
        routingKey: formatTopic(destination, destValues),
        headers: meta,
        content: destValues,
      })
    }

    return publish({
      exchange,
      routingKey: '',
      headers: { ...formatHeaders(destination, destValues), ...meta },
      content: destValues,
    })
  })
}
