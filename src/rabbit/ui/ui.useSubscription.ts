/**
 * Subscription State Management Hook
 *
 * Manages the state of user subscription selections for the subscription tree UI.
 *
 * State shape: { [source]: ParamSelection[] }
 *   Each source (e.g. 'INSTANCE') has an array of "bindings" — each binding is
 *   a Record<string, string | boolean> representing one subscription rule.
 *
 * Binding examples:
 *   [{}]                              → subscribed to ALL (no tree params set)
 *   [{ category: 'failure' }]         → subscribed to failure category
 *   [{ eventName: 'instance.create.failure' }] → subscribed to specific event
 *   [{ category: 'failure', active: true }]    → failure + active filter
 *   [{ category: 'failure' }, { category: 'success' }] → two separate subscriptions
 *
 * Tree params vs filter params:
 *   Tree params (category, eventName) define hierarchical dependencies.
 *   Filter params (active) are independent — can be added/removed from any binding.
 *   "isAllChecked" = a binding exists with NO tree params (filters may still be present).
 *
 * Toggle behaviors:
 *   toggleAll:      check → [{}], uncheck → remove source
 *   toggleCategory: if all → narrow to [{ category }], else add/remove category binding
 *   toggleEvent:    if all → narrow to [{ eventName }],
 *                   else add event binding and remove its parent category binding
 *   toggleFilter:   per-binding toggle — add/remove a filter param on each binding
 *
 * All toggle actions use functional setState (prev => ...) to avoid stale closures.
 * Derived state functions (isAllChecked, etc.) read from current subscriptions per render.
 */
import { useState, useCallback } from 'react'
import { UI_SUBSCRIPTION_ITEMS } from './ui.subscription.ts'
import { UI_TOPIC_PARAMS } from './ui.consts.ts'

type ParamSelection = Record<string, string | boolean>
type SubscriptionState = Record<string, ParamSelection[]>

// ──── Binding Utilities ────

const getTreeParamNames = (source: string): Set<string> => {
  const { [source]: config } = UI_SUBSCRIPTION_ITEMS

  if (!config) {
    return new Set()
  }

  return new Set(
    config.params
      .filter(({ constrained }) => constrained)
      .map(({ param }) => param),
  )
}

const hasNoTreeParams = (binding: ParamSelection, treeParams: Set<string>): boolean =>
  [...treeParams].every((param) => {
    const { [param]: value } = binding
    return value === undefined
  })

const matchesCategoryOnly = (binding: ParamSelection, category: string | boolean): boolean => {
  const { [UI_TOPIC_PARAMS.CATEGORY]: boundCategory, [UI_TOPIC_PARAMS.EVENT_NAME]: eventName } = binding
  return boundCategory === category && eventName === undefined
}

const matchesEvent = (binding: ParamSelection, eventName: string | boolean): boolean => {
  const { [UI_TOPIC_PARAMS.EVENT_NAME]: boundEventName } = binding
  return boundEventName === eventName
}

const replaceBindings = (
  prev: SubscriptionState,
  source: string,
  bindings: ParamSelection[],
): SubscriptionState => {
  if (bindings.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [source]: _, ...rest } = prev
    return rest
  }

  return { ...prev, [source]: bindings }
}

// ──── Hook ────

export const useSubscription = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionState>({})

  // ── Actions ──

  const toggleAll = useCallback((source: string) => {
    setSubscriptions((prev) => {
      const { [source]: bindings = [] } = prev
      const treeParams = getTreeParamNames(source)
      const allChecked = bindings.length >= 1 && hasNoTreeParams(bindings[0], treeParams)

      if (allChecked) {
        return replaceBindings(prev, source, [])
      }

      return replaceBindings(prev, source, [{}])
    })
  }, [])

  const toggleCategory = useCallback((source: string, category: string | boolean) => {
    setSubscriptions((prev) => {
      const { [source]: bindings = [] } = prev
      const treeParams = getTreeParamNames(source)
      const allChecked = bindings.length >= 1 && hasNoTreeParams(bindings[0], treeParams)

      if (allChecked) {
        return replaceBindings(prev, source, [{ [UI_TOPIC_PARAMS.CATEGORY]: category }])
      }

      const hasCategoryBinding = bindings.some((binding) => matchesCategoryOnly(binding, category))

      if (hasCategoryBinding) {
        const remaining = bindings.filter((binding) => !matchesCategoryOnly(binding, category))
        return replaceBindings(prev, source, remaining)
      }

      return replaceBindings(prev, source, [...bindings, { [UI_TOPIC_PARAMS.CATEGORY]: category }])
    })
  }, [])

  const toggleEvent = useCallback((source: string, eventName: string | boolean, category: string | boolean) => {
    setSubscriptions((prev) => {
      const { [source]: bindings = [] } = prev
      const treeParams = getTreeParamNames(source)
      const allChecked = bindings.length >= 1 && hasNoTreeParams(bindings[0], treeParams)

      if (allChecked) {
        return replaceBindings(prev, source, [{ [UI_TOPIC_PARAMS.EVENT_NAME]: eventName }])
      }

      const hasEventBinding = bindings.some((binding) => matchesEvent(binding, eventName))

      if (hasEventBinding) {
        const remaining = bindings.filter((binding) => !matchesEvent(binding, eventName))
        return replaceBindings(prev, source, remaining)
      }

      const withoutCategory = bindings.filter((binding) => !matchesCategoryOnly(binding, category))
      return replaceBindings(prev, source, [...withoutCategory, { [UI_TOPIC_PARAMS.EVENT_NAME]: eventName }])
    })
  }, [])

  const toggleFilter = useCallback((source: string, param: string, value: string | boolean) => {
    setSubscriptions((prev) => {
      const { [source]: bindings = [] } = prev

      if (bindings.length === 0) {
        return prev
      }

      const updated = bindings.map((binding) => {
        const { [param]: current, ...rest } = binding
        return current === value ? rest : { ...rest, [param]: value }
      })

      return replaceBindings(prev, source, updated)
    })
  }, [])

  // ── Derived State ──

  const isAllChecked = (source: string): boolean => {
    const { [source]: bindings = [] } = subscriptions
    const treeParams = getTreeParamNames(source)
    return bindings.length >= 1 && hasNoTreeParams(bindings[0], treeParams)
  }

  const isCategoryChecked = (source: string, category: string | boolean): boolean => {
    const { [source]: bindings = [] } = subscriptions
    return bindings.some((binding) => matchesCategoryOnly(binding, category))
  }

  const isEventChecked = (source: string, eventName: string | boolean): boolean => {
    const { [source]: bindings = [] } = subscriptions
    return bindings.some((binding) => matchesEvent(binding, eventName))
  }

  const isFilterActive = (source: string, param: string, value: string | boolean): boolean => {
    const { [source]: bindings = [] } = subscriptions
    return bindings.length > 0 && bindings.every((binding) => {
      const { [param]: current } = binding
      return current === value
    })
  }

  return {
    subscriptions,
    toggleAll,
    toggleCategory,
    toggleEvent,
    toggleFilter,
    isAllChecked,
    isCategoryChecked,
    isEventChecked,
    isFilterActive,
  }
}
