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

// ──── Base Data Schema ────
export const ecosystemEventDataSchema = z.object({
  operationId: z.string(),
  targetId: z.string(),
  entityId: z.string(),
})

// ──── Base Event Schema Factory ────
export const getBaseEcosystemEventSchema = <EventName extends string>(name: EventName) =>
  z.object({
    name: z.literal(name),
    data: z.object({}),
  })


export const uniqEcosystemEventSchema = getBaseEcosystemEventSchema(ECOSYSTEM_EVENTS.INSTANCE_STATE).extend({
  data: ecosystemEventDataSchema.extend({
    event_name: z.literal(ECOSYSTEM_EVENTS.INSTANCE_DONE),
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
