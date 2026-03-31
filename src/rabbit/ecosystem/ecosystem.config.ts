/**
 * Ecosystem Exchange Routing Configuration
 *
 * Defines how ecosystem events are routed via the 'ecosystem.topics' topic exchange.
 * Currently one source (ECOSYSTEM) with a formatter defining the routing key structure:
 *   ECOSYSTEM.{eventName}.{operation}.{target}.{entity}
 *
 * No options or filters — ecosystem events are raw and unfiltered.
 * The convertor subscribes to these topics and transforms them into UI notifications.
 *
 * Uses `as const satisfies ExchangeTopicMap` to enforce that map keys
 * match inner config values (exchange name and source must be consistent).
 */
import { EXCHANGE_TYPES, EXCHANGES } from '../rabbit/rabbit.consts.ts'
import { ECOSYSTEM_TOPIC_SOURCES, ECOSYSTEM_TOPIC_PARAMS } from './ecosystem.consts.ts'
import type { _Ecosystem } from './ecosystem.types.ts'
import type { _Rabbit } from '../rabbit/rabbit.types.ts'

// ──── Exchange Topic Map ────
export const ECOSYSTEM_EXCHANGE_TOPIC_MAP = {
  [EXCHANGES.ECOSYSTEM_TOPICS]: {
    [ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM]: {
      exchange: EXCHANGES.ECOSYSTEM_TOPICS,
      exchangeType: EXCHANGE_TYPES.TOPIC,
      source: ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM,
      formatter: [
        ECOSYSTEM_TOPIC_PARAMS.TRIGGERED_EVENT_NAME,
        ECOSYSTEM_TOPIC_PARAMS.OPERATION,
        ECOSYSTEM_TOPIC_PARAMS.TARGET,
        ECOSYSTEM_TOPIC_PARAMS.ENTITY,
        ECOSYSTEM_TOPIC_PARAMS.INSTANCE,
      ],
    },
  },
} as const satisfies _Rabbit.ExchangeTopicMap<_Ecosystem.EcosystemTopicSource>
