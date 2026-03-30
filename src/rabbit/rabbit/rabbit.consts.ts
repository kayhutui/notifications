/**
 * RabbitMQ Foundation Constants
 *
 * Defines the core building blocks for the messaging system:
 * - Exchange names: unique identifiers for each RabbitMQ exchange
 * - Exchange types: topic, headers, direct, fanout
 * - Exchange configs: pairs of name + type for each declared exchange
 *
 * Three exchanges are defined:
 *   ecosystem.topics         — topic exchange for raw ecosystem events
 *   ui.notification.topics   — topic exchange for converted UI notifications
 *   ui.notification.headers  — headers exchange for converted UI notifications
 *
 * Helper types (_RabbitExchangeName, _RabbitExchangeType) are exported
 * for use in domain *.types.ts files only — not for direct application use.
 */

export const ANY = '*'

// ──── Exchange Names ────
export const EXCHANGES = {
  ECOSYSTEM_TOPICS: 'ecosystem.topics',
  UI_NOTIFICATION_TOPICS: 'ui.notification.topics',
  UI_NOTIFICATION_HEADERS: 'ui.notification.headers',
} as const satisfies Record<string, string>

// ──── Exchange Types Enum ────
export const EXCHANGE_TYPES = {
  TOPIC: 'topic',
  HEADERS: 'headers',
  DIRECT: 'direct',
  FANOUT: 'fanout',
} as const satisfies Record<string, string>

// ──── Helpers (exported for types files only) ────
import type { _Utilities } from '../utilities.types.ts'
export type _RabbitExchangeName = _Utilities.ValuesOfObject<typeof EXCHANGES>
export type _RabbitExchangeType = _Utilities.ValuesOfObject<typeof EXCHANGE_TYPES>
export type _RabbitExchangeConfig = { name: _RabbitExchangeName; type: _RabbitExchangeType }

// ──── Exchanges + Types ────
export const EXCHANGE_CONFIGS = {
  [EXCHANGES.ECOSYSTEM_TOPICS]: { name: EXCHANGES.ECOSYSTEM_TOPICS, type: EXCHANGE_TYPES.TOPIC },
  [EXCHANGES.UI_NOTIFICATION_TOPICS]: { name: EXCHANGES.UI_NOTIFICATION_TOPICS, type: EXCHANGE_TYPES.TOPIC },
  [EXCHANGES.UI_NOTIFICATION_HEADERS]: { name: EXCHANGES.UI_NOTIFICATION_HEADERS, type: EXCHANGE_TYPES.HEADERS },
} as const satisfies Record<_RabbitExchangeName, _RabbitExchangeConfig>
