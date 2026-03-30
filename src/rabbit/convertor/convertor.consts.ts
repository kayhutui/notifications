/**
 * Convertor Mapping Configuration
 *
 * Defines how each ecosystem event is converted into UI notifications.
 * Structured as CONVERTOR_MAP[exchange][source] → EventConfig[]
 *
 * Currently maps ecosystem.topics/ECOSYSTEM events to two UI destinations:
 *   1. ui.notification.topics/INSTANCE  (topic exchange — routing key based)
 *   2. ui.notification.headers/INSTANCE (headers exchange — header matching)
 *
 * Two event conversions are configured:
 *
 *   instanceFailure → UI notification with category='failure', active=true
 *     - dynamic: operation, target, entity extracted from ecosystem event data
 *     - meta: "Instance {entity} failed"
 *
 *   instanceSuccess → UI notification with category='success', active=true
 *     - dynamic: operation, target, entity extracted from ecosystem event data
 *     - meta: "Instance {entity} created successfully"
 *
 * The `as const satisfies ConvertorMap<...>` constraint ensures:
 *   - Map keys match inner config exchange/source values
 *   - staticValues/dynamicValues only use valid destination formatter params
 *   - subscribeWith only uses valid source formatter params
 */
import { EXCHANGES } from '../rabbit/rabbit.consts.ts'
import { ECOSYSTEM_EVENTS, ECOSYSTEM_TOPIC_SOURCES } from '../ecosystem/ecosystem.consts.ts'
import { ECOSYSTEM_EXCHANGE_TOPIC_MAP } from '../ecosystem/ecosystem.config.ts'
import { UI_EXCHANGE_TOPIC_MAP, UI_EXCHANGE_HEADERS_MAP } from '../ui/ui.config.ts'
import type { _Convertor } from './convertor.types.ts'
import type { _Ecosystem } from '../ecosystem/ecosystem.types.ts'
import type { _UI } from '../ui/ui.types.ts'

const ecosystemTopicConfig = ECOSYSTEM_EXCHANGE_TOPIC_MAP[EXCHANGES.ECOSYSTEM_TOPICS][ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM]
const uiTopicConfig = UI_EXCHANGE_TOPIC_MAP[EXCHANGES.UI_NOTIFICATION_TOPICS]['INSTANCE']
const uiHeadersConfig = UI_EXCHANGE_HEADERS_MAP[EXCHANGES.UI_NOTIFICATION_HEADERS]['INSTANCE']

export const CONVERTOR_MAP = {
  [EXCHANGES.ECOSYSTEM_TOPICS]: {
    [ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM]: [
      {
        eventName: ECOSYSTEM_EVENTS.INSTANCE_FAILED,
        source: ecosystemTopicConfig,
        subscribeWith: { eventName: 'instanceDone' },
        destinations: [uiTopicConfig, uiHeadersConfig],
        staticValues: { category: 'failure', active: true },
        dynamicValues: { operation: 'operation_id', target: 'target_id', entity: 'entity_id' },
        getMeta: ({ entity }) => ({
          title: `Instance ${entity} failed`,
        }),
      },
      {
        eventName: ECOSYSTEM_EVENTS.INSTANCE_SUCCESS,
        source: ecosystemTopicConfig,
        subscribeWith: {},
        destinations: [uiTopicConfig, uiHeadersConfig],
        staticValues: { category: 'success', active: true },
        dynamicValues: { operation: 'operationId', target: 'targetId', entity: 'entityId' },
        getMeta: ({ entity }) => ({
          title: `Instance ${entity} created successfully`,
        }),
      },
    ],
  },
} as const satisfies _Convertor.ConvertorMap<
  _Ecosystem.EcosystemTopicSource,
  _Ecosystem.EcosystemTopicParam,
  _UI.UiTopicParam
>
