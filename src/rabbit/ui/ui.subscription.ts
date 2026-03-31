/**
 * Subscription Parameter Derivation
 *
 * Derives subscription UI data from UI exchange route configs (options + filters).
 * Consumed by the subscription hook (ui.useSubscription.ts) and example component.
 *
 * For each source in the UI topic exchange, getSubscriptionParams produces:
 *
 *   params: array of { param, constrained, values }
 *     - constrained=true: param appears in options (tree param, e.g. category, eventName)
 *     - constrained=false: param is free-form (e.g. operation, target)
 *
 *   filters: array of { param, values }
 *     - independent params that can be toggled on any binding (e.g. active: [true, false])
 *
 *   getFilteredOptions(selections): cascading filter function
 *     - given partial selections (e.g. { category: 'failure' }),
 *       returns available values for each tree param
 *     - enables dependent dropdowns / tree UI:
 *       selecting category='failure' constrains eventName to ['instance.create.failure']
 *
 * Key distinction:
 *   - options (tree params): dependent, hierarchical — category constrains eventName
 *   - filters:               independent — active can be added to any binding
 *
 * UI_SUBSCRIPTION_ITEMS is the final export: { [source]: { params, filters, getFilteredOptions } }
 */
import { EXCHANGES } from '../rabbit/rabbit.consts.ts'
import { UI_EXCHANGE_TOPIC_MAP } from './ui.config.ts'

type OptionCombo = Partial<Record<string, string | boolean>>
type FilterMap = Record<string, readonly (string | boolean)[]>

const { [EXCHANGES.UI_CONVERTED_TOPICS]: topicConfigs } = UI_EXCHANGE_TOPIC_MAP

const getUniqueValues = (combos: readonly OptionCombo[], param: string) =>
  [...new Set(combos.map((combo) => combo[param]).filter((value) => value !== undefined))]

const getSubscriptionParams = (config: {
  formatter: readonly string[]
  options?: readonly OptionCombo[]
  filters?: FilterMap
}) => {
  const { formatter, options = [], filters = {} } = config

  const treeParams = new Set(options.flatMap((combo) => Object.keys(combo)))
  const filterParams = Object.keys(filters)

  return {
    params: formatter.map((param) => ({
      param,
      constrained: treeParams.has(param),
      values: treeParams.has(param) ? getUniqueValues(options, param) : undefined,
    })),
    filters: filterParams.map((param) => ({
      param,
      values: filters[param],
    })),
    getFilteredOptions: (selections: OptionCombo) => {
      const filtered = options.filter((combo) =>
        Object.entries(selections).every(([param, value]) => {
          const { [param]: comboValue } = combo
          return comboValue === undefined || comboValue === value
        }),
      )

      return Object.fromEntries(
        [...treeParams].map((param) => [param, getUniqueValues(filtered, param)]),
      )
    },
  }
}

export const UI_SUBSCRIPTION_ITEMS = Object.fromEntries(
  Object.entries(topicConfigs).map(([source, config]) => [
    source,
    getSubscriptionParams(config),
  ]),
)
