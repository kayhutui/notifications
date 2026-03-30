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
  INSTANCE_FAILED: 'instanceFailure',
  INSTANCE_SUCCESS: 'instanceSuccess',
} as const satisfies Record<string, string>

// ──── Topic Sources (first segment of topic) ────
export const ECOSYSTEM_TOPIC_SOURCES = {
  ECOSYSTEM: 'ECOSYSTEM',
} as const satisfies Record<string, Uppercase<string>>

// ──── Topic Params ────
export const ECOSYSTEM_TOPIC_PARAMS = {
  EVENT_NAME: 'eventName',
  OPERATION_ID: 'operation',
  TARGET_ID: 'target',
  ENTITY_ID: 'entity',
} as const satisfies Record<string, string>
