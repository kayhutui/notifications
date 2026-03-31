/**
 * Convertor Mapping Configuration
 *
 * Defines how each ecosystem event is converted into UI notifications.
 * Structured as CONVERTOR_MAP[exchange][source] → EventConfig[]
 *
 * Currently, maps ecosystem.topics/ECOSYSTEM events to two UI destinations:
 *   1. ui.converted.topics/INSTANCE  (topic exchange — routing key based)
 *   2. ui.converted.headers/INSTANCE (headers exchange — header matching)
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
import { ECOSYSTEM_EVENTS, ECOSYSTEM_TOPIC_SOURCES, ECOSYSTEM_TOPIC_PARAMS } from '../ecosystem/ecosystem.consts.ts'
import { ECOSYSTEM_EXCHANGE_TOPIC_MAP } from '../ecosystem/ecosystem.config.ts'
import { UI_EXCHANGE_TOPIC_MAP, UI_EXCHANGE_HEADERS_MAP } from '../ui/ui.config.ts'
import { UI_TOPIC_PARAMS, UI_CATEGORIES } from '../ui/ui.consts.ts'
import type { _Convertor } from './convertor.types.ts'
import type { _Ecosystem } from '../ecosystem/ecosystem.types.ts'
import { ECOSYSTEM_DATA_FIELDS } from '../ecosystem/ecosystem.schemas.ts'
import type { _UI } from '../ui/ui.types.ts'

const { [EXCHANGES.ECOSYSTEM_TOPICS]: { [ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM]: ecosystemTopicConfig } } = ECOSYSTEM_EXCHANGE_TOPIC_MAP
const { [ECOSYSTEM_EVENTS.INSTANCE_FAILED]: failedFields } = ECOSYSTEM_DATA_FIELDS
const { [ECOSYSTEM_EVENTS.INSTANCE_SUCCESS]: successFields } = ECOSYSTEM_DATA_FIELDS
const { [EXCHANGES.UI_CONVERTED_TOPICS]: { INSTANCE: uiTopicConfig } } = UI_EXCHANGE_TOPIC_MAP
const { [EXCHANGES.UI_CONVERTED_HEADERS]: { INSTANCE: uiHeadersConfig } } = UI_EXCHANGE_HEADERS_MAP

export const CONVERTOR_MAP = {
  [EXCHANGES.ECOSYSTEM_TOPICS]: {
    [ECOSYSTEM_TOPIC_SOURCES.ECOSYSTEM]: [
      {
        eventName: ECOSYSTEM_EVENTS.INSTANCE_FAILED,
        source: ecosystemTopicConfig,
        subscribeWith: { [ECOSYSTEM_TOPIC_PARAMS.TRIGGERED_EVENT_NAME]: ECOSYSTEM_EVENTS.INSTANCE_DONE },
        destinations: [uiTopicConfig, uiHeadersConfig],
        staticValues: { [UI_TOPIC_PARAMS.CATEGORY]: UI_CATEGORIES.FAILED, [UI_TOPIC_PARAMS.IS_ACTIVE]: true },
        dynamicValues: { [UI_TOPIC_PARAMS.OPERATION_ID]: failedFields.OPERATION_ID, [UI_TOPIC_PARAMS.TARGET_ID]: failedFields.TARGET_ID, [UI_TOPIC_PARAMS.ENTITY_ID]: failedFields.ENTITY_ID, [UI_TOPIC_PARAMS.INSTANCE]: failedFields.ENTITY_ID },
        getMeta: ({ [UI_TOPIC_PARAMS.INSTANCE]: instance }) => ({
          title: `Instance ${instance} failed`,
          targetData: { targetId: instance },
        }),
      },
      {
        eventName: ECOSYSTEM_EVENTS.INSTANCE_SUCCESS,
        source: ecosystemTopicConfig,
        subscribeWith: {},
        destinations: [uiTopicConfig, uiHeadersConfig],
        staticValues: { [UI_TOPIC_PARAMS.CATEGORY]: UI_CATEGORIES.SUCCESS, [UI_TOPIC_PARAMS.IS_ACTIVE]: true },
        dynamicValues: { [UI_TOPIC_PARAMS.OPERATION_ID]: successFields.OPERATION_ID, [UI_TOPIC_PARAMS.TARGET_ID]: successFields.TARGET_ID, [UI_TOPIC_PARAMS.ENTITY_ID]: successFields.ENTITY_ID },
        getMeta: ({ [UI_TOPIC_PARAMS.ENTITY_ID]: entity }) => ({
          title: `Instance ${entity} created successfully`,
          targetData: { targetId: entity },
        }),
      },
    ],
  },
} as const satisfies _Convertor.ConvertorMap<
  _Ecosystem.EcosystemTopicSource,
  _Ecosystem.EcosystemTopicParam,
  _UI.UiTopicParam,
  _UI.UiParamValueMap
>
