/**
 * UI Domain Constants
 *
 * The UI domain handles notifications displayed to users. Events come from two origins:
 *   1. Direct UI events (UI_EVENTS) — created by the BFF (e.g. user.create.info)
 *   2. Converted events (UI_CONVERTED_EVENTS) — transformed from ecosystem events by the convertor
 *
 * Event names follow the pattern: {target}.{action}.{category}
 *   e.g. "instance.create.failure", "user.create.info"
 *
 * - UI_CATEGORIES:        info | success | failure
 * - UI_TOPIC_TARGETS:     user | instance (the entity type)
 * - UI_ACTIONS:           create | update
 * - UI_EVENTS:            direct BFF-originated events
 * - UI_CONVERTED_EVENTS:  events converted from ecosystem
 * - UI_TOPIC_SOURCES:     UI (direct) | INSTANCE (converted) — first routing key segment
 * - UI_TOPIC_PARAMS:       param names for the topic formatter segments
 *
 * Topic format for INSTANCE: INSTANCE.{eventName}.{operation}.{target}.{entity}.{active}.{category}
 * Topic format for UI:       UI.{user}
 *
 * Helper types (_UiTopicTarget, _UiAction, etc.) are exported for use in ui.types.ts only.
 */
import type { _Utilities } from '../utilities.types.ts'

// ──── Categories ────
export const UI_CATEGORIES = {
  INFO: 'info',
  SUCCESS: 'success',
  FAILED: 'failure',
} as const

// ──── Topic Targets ────
export const UI_TOPIC_TARGETS = {
  USER: 'user',
  INSTANCE: 'instance',
} as const

// ──── Actions ────
export const UI_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
} as const

// ──── Helpers (exported for types files only) ────
export type _UiTopicTarget = _Utilities.ValuesOfObject<typeof UI_TOPIC_TARGETS>
export type _UiAction = _Utilities.ValuesOfObject<typeof UI_ACTIONS>
export type _UiCategory = _Utilities.ValuesOfObject<typeof UI_CATEGORIES>
export type _UiEventName = `${_UiTopicTarget}.${_UiAction}.${_UiCategory}`

// ──── User Events (originated by UI) ────
export const UI_EVENTS = {
  USER_CREATED: `user.create.info`,
  USER_UPDATED: `instance.update.info`,
} as const satisfies Record<string, _UiEventName>

// ──── Converted Events (ecosystem → UI) ────
export const UI_CONVERTED_EVENTS = {
  INSTANCE_CREATE_FAILED: `instance.create.failure`,
  INSTANCE_CREATE_SUCCESS: `instance.create.success`,
} as const satisfies Record<string, _UiEventName>

// ──── Topic Sources (first segment of topic) ────
export const UI_TOPIC_SOURCES = {
  UI: 'UI',
  INSTANCE: 'INSTANCE',
} as const satisfies Record<string, Uppercase<string>>

// ──── Topic Params ────
export const UI_TOPIC_PARAMS = {
  EVENT_NAME: 'eventName',
  OPERATION: 'operation',
  TARGET: 'target',
  ENTITY: 'entity',
  RECEIVER: 'receiver',
  INSTANCE: 'instance',
  IS_ACTIVE: 'active',
  CATEGORY: 'category',
} as const
