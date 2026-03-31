/**
 * Convertor Logic — Ecosystem → UI Event Conversion
 *
 * Main entry point: convertEcosystemEvent(rawEvent)
 *
 * Flow:
 *   1. Parse:   validate raw event with ecosystemEventSchema (Zod discriminated union)
 *               → typed { eventName, data }
 *   2. Match:   find the EventConfig in CONVERTOR_MAP by eventName
 *   3. Resolve: build destination values by merging:
 *               - staticValues:  fixed params from config (e.g. { category: 'failure', active: true })
 *               - dynamicValues: params extracted from parsed event data (e.g. operation ← data.operationId)
 *   4. Meta:    call getMeta(destValues) to build message metadata (e.g. notification title)
 *   5. Format:  for each destination config, produce a Publication:
 *               - topic exchange:   routingKey = formatted topic string, headers = meta
 *               - headers exchange: routingKey = '', headers = routing headers + meta
 *
 * Returns Publication[] — one per destination (currently 2: topic + headers exchange).
 */
import { ecosystemEventSchema } from '../ecosystem/ecosystem.schemas.ts'
import { CONVERTOR_MAP } from './convertor.config.ts'
import { EXCHANGES } from '../rabbit/rabbit.consts.ts'
import { ECOSYSTEM_TOPIC_SOURCES } from '../ecosystem/ecosystem.consts.ts'
import { formatTopic, formatHeaders } from '../rabbit/rabbit.utils.ts'
import type { _Rabbit } from '../rabbit/rabbit.types.ts'

// ──── Types ────

type DestinationValues = Record<string, string | boolean>

type Publication = {
  exchange: string
  routingKey: string
  headers: Record<string, unknown>
}

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

// ──── Value Resolution ────

const resolveDestinationValues = (
  staticValues: Partial<Record<string, string | boolean>>,
  dynamicValues: Partial<Record<string, string>>,
  data: Record<string, string>,
): DestinationValues => {
  const staticEntries = Object.entries(staticValues).filter(
    (entry): entry is [string, string | boolean] => entry[1] !== undefined,
  )

  const dynamicEntries = Object.entries(dynamicValues)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([destParam, dataKey]): [string, string] => {
      const { [dataKey]: value } = data
      return [destParam, value]
    })

  return Object.fromEntries([...staticEntries, ...dynamicEntries])
}

// ──── Publication Formatting ────

const formatPublication = (
  destination: _Rabbit.TopicRouteConfig | _Rabbit.HeadersRouteConfig,
  values: DestinationValues,
  meta: Record<string, unknown>,
): Publication => {
  const { exchange, exchangeType } = destination

  if (exchangeType === 'topic') {
    return {
      exchange,
      routingKey: formatTopic(destination, values),
      headers: meta,
    }
  }

  return {
    exchange,
    routingKey: '',
    headers: { ...formatHeaders(destination, values), ...meta },
  }
}

// ──── Main Conversion ────
export const convertEcosystemEvent = (rawEvent: unknown): Publication[] => {
  const { eventName, data } = ecosystemEventSchema.parse(rawEvent)
  const config = findEventConfig(eventName)
  const { staticValues, dynamicValues, destinations, getMeta, enrich } = config
  const dataRecord = Object.fromEntries(Object.entries(data))
  const destValues = resolveDestinationValues(staticValues, dynamicValues, dataRecord)
  const meta = getMeta(destValues)

  return destinations.map((destination) => formatPublication(destination, destValues, meta))
}
