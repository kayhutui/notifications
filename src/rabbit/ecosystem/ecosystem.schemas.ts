/**
 * Ecosystem Event Zod Schemas
 *
 * Validates and types raw ecosystem event payloads.
 *
 * Structure: { eventName: string, data: { operationId, targetId, entityId } }
 *
 * - getBaseEcosystemEventSchema(name): factory that creates a schema with a literal eventName
 * - instanceFailureEventSchema:        extends base with ecosystemEventDataSchema
 * - instanceSuccessEventSchema:        extends base with ecosystemEventDataSchema
 * - ecosystemEventSchema:              discriminated union on 'eventName' — the main entry point
 *                                      for parsing unknown events in the convertor
 *
 * Usage: ecosystemEventSchema.parse(rawEvent) → typed { eventName, data }
 */
import { z } from 'zod'
import { ECOSYSTEM_EVENTS } from './ecosystem.consts.ts'
import type { _Ecosystem } from './ecosystem.types.ts'

/** Base data fields shared across all ecosystem events */
const BASE_DATA_FIELDS = {
  OPERATION_ID: 'operation_id',
  TARGET_ID: 'target_id',
  ENTITY_ID: 'entity_id',
  INSTANCE_ID: 'instance_id'
} as const

/** Per-event data field maps — each event declares only its own valid fields */
export const ECOSYSTEM_DATA_FIELDS = {
  [ECOSYSTEM_EVENTS.INSTANCE_FAILED]: BASE_DATA_FIELDS,
  [ECOSYSTEM_EVENTS.INSTANCE_SUCCESS]: BASE_DATA_FIELDS,
  [ECOSYSTEM_EVENTS.INSTANCE_STATE]: {
    ...BASE_DATA_FIELDS,
    EVENT_NAME: 'event_name',
    STATE: 'state',
  },
} as const

export type EcosystemEventDataFields = typeof ECOSYSTEM_DATA_FIELDS

// ──── Base Data Schema ────
export const ecosystemEventDataSchema = z.object({
  [BASE_DATA_FIELDS.OPERATION_ID]: z.string(),
  [BASE_DATA_FIELDS.TARGET_ID]: z.string(),
  [BASE_DATA_FIELDS.ENTITY_ID]: z.string(),
})

// ──── Base Event Schema Factory ────
export const getBaseEcosystemEventSchema = <EventName extends string>(name: EventName) =>
  z.object({
    name: z.literal(name),
    data: z.object({}),
  })


const stateFields = ECOSYSTEM_DATA_FIELDS[ECOSYSTEM_EVENTS.INSTANCE_STATE]

export const uniqEcosystemEventSchema = getBaseEcosystemEventSchema(ECOSYSTEM_EVENTS.INSTANCE_STATE).extend({
  data: ecosystemEventDataSchema.extend({
    [stateFields.EVENT_NAME]: z.literal(ECOSYSTEM_EVENTS.INSTANCE_DONE),
    [stateFields.STATE]: z.string(),
  }),
})

// ──── Per-Event Schemas ────
export const instanceFailureEventSchema = getBaseEcosystemEventSchema(ECOSYSTEM_EVENTS.INSTANCE_FAILED).extend({
  data: ecosystemEventDataSchema,
})

export const instanceSuccessEventSchema = getBaseEcosystemEventSchema(ECOSYSTEM_EVENTS.INSTANCE_SUCCESS).extend({
  data: ecosystemEventDataSchema,
})

// ──── Event Schema Map ────
export const ECOSYSTEM_EVENT_SCHEMA_MAP = {
  [ECOSYSTEM_EVENTS.INSTANCE_FAILED]: instanceFailureEventSchema,
  [ECOSYSTEM_EVENTS.INSTANCE_SUCCESS]: instanceSuccessEventSchema,
  [ECOSYSTEM_EVENTS.INSTANCE_STATE]: uniqEcosystemEventSchema,
} as const satisfies Partial<Record<_Ecosystem.EcosystemEvent, z.ZodTypeAny>>

// ──── Union Schema ────
const standardEvents = z.discriminatedUnion('name', [
  instanceFailureEventSchema,
  instanceSuccessEventSchema,
]).transform(({ name, data }) => ({ eventName: name, data }))

const stateEvent = uniqEcosystemEventSchema.transform(({ data }) => {
  const { event_name, ...rest } = data
  return { eventName: event_name, data: rest }
})

export const ecosystemEventSchema = standardEvents.or(stateEvent)
