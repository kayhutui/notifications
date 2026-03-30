/**
 * Ecosystem Domain Types
 *
 * Type aliases derived from ecosystem constants via ValuesOfObject:
 *   EcosystemTopicSource — 'ECOSYSTEM' (literal union of source values)
 *   EcosystemTopicParam  — 'eventName' | 'operation' | 'target' | 'entity'
 *   EcosystemEvent       — 'instanceFailure' | 'instanceSuccess'
 *   EcosystemParsedMessage — { eventName: string, operation: string, target: string, entity: string }
 */
import { ECOSYSTEM_TOPIC_SOURCES, ECOSYSTEM_TOPIC_PARAMS } from './ecosystem.consts.ts'
import { ECOSYSTEM_EVENTS } from './ecosystem.consts.ts'
import type { _Utilities } from '../utilities.types.ts'

export declare namespace _Ecosystem {
  export type EcosystemTopicSource = _Utilities.ValuesOfObject<typeof ECOSYSTEM_TOPIC_SOURCES>
  export type EcosystemTopicParam = _Utilities.ValuesOfObject<typeof ECOSYSTEM_TOPIC_PARAMS>

  /** Literal union of all concrete ecosystem event values */
  export type EcosystemEvent = _Utilities.ValuesOfObject<typeof ECOSYSTEM_EVENTS>

  /** Parsed ecosystem message — what the converter extracts from ecosystem events */
  export type EcosystemParsedMessage = { [Param in EcosystemTopicParam]: string }
}
