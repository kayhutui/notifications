/**
 * UI Domain Types
 *
 * Type aliases derived from UI constants via ValuesOfObject:
 *   UiTopicSource    — 'UI' | 'INSTANCE'
 *   UiTopicParam     — 'eventName' | 'operation' | 'target' | 'entity' | 'user' | 'active' | 'category'
 *   UiCategory       — 'info' | 'success' | 'failure'
 *   UiTopicTarget    — 'user' | 'instance'
 *   UiAction         — 'create' | 'update'
 *   UiEventName      — template literal: '{target}.{action}.{category}'
 *   UiEvent          — literal union of direct UI event values
 *   UiConvertedEvent — literal union of converted event values
 *   UiEnrichedMessage — full shape produced by the convertor: { [UiTopicParam]: string }
 */
import {
  type _UiTopicTarget,
  type _UiAction,
  type _UiCategory,
  UI_TOPIC_SOURCES,
  UI_TOPIC_PARAMS,
} from './ui.consts.ts'
import { UI_EVENTS, UI_CONVERTED_EVENTS } from './ui.consts.ts'
import { UI_EXCHANGE_TOPIC_MAP, UI_EXCHANGE_HEADERS_MAP } from './ui.config.ts'
import { EXCHANGES } from '../rabbit/rabbit.consts.ts'
import type { _Utilities } from '../utilities.types.ts'

export declare namespace _UI {
  export type UiTopicSource = _Utilities.ValuesOfObject<typeof UI_TOPIC_SOURCES>
  export type UiTopicParam = _Utilities.ValuesOfObject<typeof UI_TOPIC_PARAMS>

  export type UiCategory = _UiCategory
  export type UiTopicTarget = _UiTopicTarget
  export type UiAction = _UiAction
  export type UiEventName = `${UiTopicTarget}.${UiAction}.${UiCategory}`

  /** Literal union of all direct UI event values */
  export type UiEvent = _Utilities.ValuesOfObject<typeof UI_EVENTS>

  /** Literal union of all converted event values (ecosystem → UI) */
  export type UiConvertedEvent = _Utilities.ValuesOfObject<typeof UI_CONVERTED_EVENTS>

  /** Full exchange headers map type (preserves as const literals) */
  export type UiExchangeHeadersMap = typeof UI_EXCHANGE_HEADERS_MAP

  /** The INSTANCE route config — source of truth for options/filters */
  type _InstanceConfig = (typeof UI_EXCHANGE_TOPIC_MAP)[typeof EXCHANGES.UI_CONVERTED_TOPICS][typeof UI_TOPIC_SOURCES.INSTANCE]

  /** Extract value types from options: for each param, union of all values across option combos */
  type _OptionValues = _InstanceConfig['options'][number]

  /** Extract value types from filters: for each param, the array element type */
  type _FilterValues = { [K in keyof _InstanceConfig['filters']]: _InstanceConfig['filters'][K][number] }

  /** Constrained params — those appearing in options or filters */
  type _ConstrainedParams = keyof _OptionValues | keyof _FilterValues

  /** Maps each UI param to its allowed value type, derived from config options/filters */
  export type UiParamValueMap = {
    [K in UiTopicParam]: K extends keyof _OptionValues
      ? _OptionValues[K]
      : K extends keyof _FilterValues
        ? _FilterValues[K]
        : string
  }

  /** Enriched message — the full shape the converter produces for UI exchanges */
  export type UiEnrichedMessage = { [Param in UiTopicParam]: string }
}
