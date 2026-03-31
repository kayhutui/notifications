/**
 * Ecosystem Domain Constants
 *
 * The ecosystem domain represents raw events from external services.
 * These events are consumed by the convertor and transformed into UI notifications.
 *
 * - ECOSYSTEM_EVENTS:         event name values (e.g. 'instanceFailure', 'instanceSuccess')
 * - ECOSYSTEM_TOPIC_SOURCES:  source identifiers (first routing key segment), always UPPERCASE
 * - ECOSYSTEM_TOPIC_PARAMS:   param names for the topic formatter segments
 *
 * Topic format: ECOSYSTEM.{eventName}.{operation}.{target}.{entity}
 */

// ──── Events ────
export const ECOSYSTEM_EVENTS = {
  INSTANCE_FAILED: 'instanceFailureEvent',
  INSTANCE_SUCCESS: 'instanceSuccessEvent',
  INSTANCE_STATE: 'instanceStateEvent',
  INSTANCE_DONE: 'instanceDoneEvent',
} as const

// ──── Topic Sources (first segment of topic) ────
export const ECOSYSTEM_TOPIC_SOURCES = {
  ECOSYSTEM: 'ECOSYSTEM',
} as const

// ──── Topic Params ────
export const ECOSYSTEM_TOPIC_PARAMS = {
  TRIGGERED_EVENT_NAME: 'triggeredEventName',
  EVENT_TYPE: 'eventType',
  OPERATION: 'operation',
  TARGET: 'target',
  ENTITY: 'entity',
  INSTANCE: 'instance',
} as const
