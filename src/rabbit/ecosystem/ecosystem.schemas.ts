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

// ──── Base Data Schema ────
export const ecosystemEventDataSchema = z.object({
  operationId: z.string(),
  targetId: z.string(),
  entityId: z.string(),
})

// ──── Base Event Schema Factory ────
export const getBaseEcosystemEventSchema = <EventName extends string>(name: EventName) =>
  z.object({
    eventName: z.literal(name),
    data: z.object({}),
  })

// ──── Per-Event Schemas ────
export const instanceFailureEventSchema = getBaseEcosystemEventSchema(ECOSYSTEM_EVENTS.INSTANCE_FAILED).extend({
  data: ecosystemEventDataSchema,
})

export const instanceSuccessEventSchema = getBaseEcosystemEventSchema(ECOSYSTEM_EVENTS.INSTANCE_SUCCESS).extend({
  data: ecosystemEventDataSchema,
})

// ──── Union Schema ────
export const ecosystemEventSchema = z.discriminatedUnion('eventName', [
  instanceFailureEventSchema,
  instanceSuccessEventSchema,
])
