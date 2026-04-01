/**
 * UI Exchange Routing Configuration
 *
 * Defines how UI notifications are routed across three exchanges:
 *
 * 1. Topic exchange (ui.feed.topics):
 *    - UI source:       simple routing by user param only (formatter: [user])
 *
 * 2. Topic exchange (ui.converted.topics):
 *    - INSTANCE source: full routing with options + filters
 *
 * 3. Headers exchange (ui.converted.headers):
 *    - INSTANCE source: same options/filters as topic, but matched via header key-values
 *
 * The INSTANCE configs include:
 *   options: valid dependent param combinations (tree structure)
 *     [{ eventName: 'instance.create.failure', category: 'failure' },
 *      { eventName: 'instance.create.success', category: 'success' }]
 *     → category and eventName are linked: selecting a category constrains available events
 *
 *   filters: independent params with predefined values
 *     { active: [true, false] }
 *     → active can be added to any subscription binding regardless of category/event selection
 *
 * These options/filters drive the subscription UI tree (see ui.subscription.ts).
 */
import { EXCHANGE_TYPES, EXCHANGES } from '../rabbit/rabbit.consts.ts'
import { UI_TOPIC_SOURCES, UI_TOPIC_PARAMS, UI_CATEGORIES, UI_CONVERTED_EVENTS } from './ui.consts.ts'
import type { _UI } from './ui.types.ts'
import type { _Rabbit } from '../rabbit/rabbit.types.ts'

// ──── Shared INSTANCE Route Shape ────
const INSTANCE_ROUTE_SHAPE = {
  source: UI_TOPIC_SOURCES.INSTANCE,
  formatter: [
    UI_TOPIC_PARAMS.EVENT_NAME,
    UI_TOPIC_PARAMS.OPERATION,
    UI_TOPIC_PARAMS.TARGET,
    UI_TOPIC_PARAMS.ENTITY,
    UI_TOPIC_PARAMS.IS_ACTIVE,
    UI_TOPIC_PARAMS.CATEGORY,
  ],
  options: [
    { [UI_TOPIC_PARAMS.EVENT_NAME]: UI_CONVERTED_EVENTS.INSTANCE_CREATE_FAILED, [UI_TOPIC_PARAMS.CATEGORY]: UI_CATEGORIES.FAILED },
    { [UI_TOPIC_PARAMS.EVENT_NAME]: UI_CONVERTED_EVENTS.INSTANCE_CREATE_SUCCESS, [UI_TOPIC_PARAMS.CATEGORY]: UI_CATEGORIES.SUCCESS },
  ],
  filters: {
    [UI_TOPIC_PARAMS.IS_ACTIVE]: [true, false],
  },
} as const

// ──── Exchange Topic Map ────
export const UI_EXCHANGE_TOPIC_MAP = {
  [EXCHANGES.UI_FEED_TOPICS]: {
    [UI_TOPIC_SOURCES.UI]: {
      exchange: EXCHANGES.UI_FEED_TOPICS,
      exchangeType: EXCHANGE_TYPES.TOPIC,
      source: UI_TOPIC_SOURCES.UI,
      formatter: [UI_TOPIC_PARAMS.RECEIVER],
    },
  },
  [EXCHANGES.UI_CONVERTED_TOPICS]: {
    [UI_TOPIC_SOURCES.INSTANCE]: {
      exchange: EXCHANGES.UI_CONVERTED_TOPICS,
      exchangeType: EXCHANGE_TYPES.TOPIC,
      ...INSTANCE_ROUTE_SHAPE,
    },
  },
} as const satisfies _Rabbit.ExchangeTopicMap<_UI.UiTopicSource>

// ──── Exchange Headers Map ────
export const UI_EXCHANGE_HEADERS_MAP = {
  [EXCHANGES.UI_CONVERTED_HEADERS]: {
    [UI_TOPIC_SOURCES.INSTANCE]: {
      exchange: EXCHANGES.UI_CONVERTED_HEADERS,
      exchangeType: EXCHANGE_TYPES.HEADERS,
      ...INSTANCE_ROUTE_SHAPE,
    },
  },
} as const satisfies _Rabbit.ExchangeHeadersMap<_UI.UiTopicSource>
