/**
 * RabbitMQ Foundation Constants
 *
 * Defines the core building blocks for the messaging system:
 * - Exchange names: unique identifiers for each RabbitMQ exchange
 * - Exchange types: topic, headers, direct, fanout
 * - Exchange configs: pairs of name + type for each declared exchange
 *
 * Four exchanges are defined:
 *   ecosystem.topics         — topic exchange for raw ecosystem events
 *   ui.converted.topics      — topic exchange for converted UI notifications
 *   ui.converted.headers     — headers exchange for converted UI notifications
 *   ui.feed.topics           — topic exchange for direct UI user events
 *
 * Helper types (_RabbitExchangeName, _RabbitExchangeType) are exported
 * for use in domain *.types.ts files only — not for direct application use.
 */

export const ANY = '*'

// ──── Exchange Names ────
export const EXCHANGES = {
  ECOSYSTEM_TOPICS: 'ecosystem.topics',
  UI_CONVERTED_TOPICS: 'ui.converted.topics',
  UI_CONVERTED_HEADERS: 'ui.converted.headers',
  UI_FEED_TOPICS: 'ui.feed.topics',
} as const

// ──── Exchange Types Enum ────
export const EXCHANGE_TYPES = {
  TOPIC: 'topic',
  HEADERS: 'headers',
  DIRECT: 'direct',
  FANOUT: 'fanout',
} as const

// ──── Helpers (exported for types files only) ────
import type { _Utilities } from '../utilities.types.ts'
export type _RabbitExchangeName = _Utilities.ValuesOfObject<typeof EXCHANGES>
export type _RabbitExchangeType = _Utilities.ValuesOfObject<typeof EXCHANGE_TYPES>
export type _RabbitExchangeConfig = { name: _RabbitExchangeName; type: _RabbitExchangeType }

// ──── Exchanges + Types ────
export const EXCHANGES_WITH_TYPES = [
  { name: EXCHANGES.ECOSYSTEM_TOPICS, type: EXCHANGE_TYPES.TOPIC },
  { name: EXCHANGES.UI_CONVERTED_TOPICS, type: EXCHANGE_TYPES.TOPIC },
  { name: EXCHANGES.UI_CONVERTED_HEADERS, type: EXCHANGE_TYPES.HEADERS },
  { name: EXCHANGES.UI_FEED_TOPICS, type: EXCHANGE_TYPES.TOPIC },
] as const satisfies readonly _RabbitExchangeConfig[]
