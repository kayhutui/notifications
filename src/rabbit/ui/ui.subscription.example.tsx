/**
 * Subscription Tree Example
 *
 * Tree params (options): category → eventName — dependent, hierarchical
 * Filter params (filters): active — independent, can be added to any binding
 *
 * Tree structure:
 *   INSTANCE
 *     ☐ all
 *     ☐ failure
 *       ☐ instance.create.failure
 *     ☐ success
 *       ☐ instance.create.success
 *     ── filters ──
 *     active: [true] [false]
 *
 * Result examples:
 *   Check "failure"               → [{ category: "failure" }]
 *   Check "failure" + active=true → [{ category: "failure", active: true }]
 *   Check event + active=false    → [{ eventName: "...", active: false }]
 */

import { UI_SUBSCRIPTION_ITEMS } from './ui.subscription.ts'
import { useSubscription } from './ui.useSubscription.ts'

const SubscriptionTree = () => {
  const {
    subscriptions,
    toggleAll,
    toggleCategory,
    toggleEvent,
    toggleFilter,
    isAllChecked,
    isCategoryChecked,
    isEventChecked,
    isFilterActive,
  } = useSubscription()

  return (
    <div>
      {Object.entries(UI_SUBSCRIPTION_ITEMS).map(([source, { filters, getFilteredOptions }]) => {
        const { [source]: bindings = [] } = subscriptions
        const categories = getFilteredOptions({}).category || []
        const allChecked = isAllChecked(source)

        if (categories.length === 0) {
          return null
        }

        return (
          <div key={source}>
            <h3>{source}</h3>

            <div style={{ paddingLeft: 16 }}>
              <label>
                <input type="checkbox" checked={allChecked} onChange={() => toggleAll(source)} />
                all
              </label>
            </div>

            {categories.map((category) => {
              const categoryChecked = isCategoryChecked(source, category)
              const events = getFilteredOptions({ category }).eventName || []

              return (
                <div key={String(category)} style={{ paddingLeft: 16 }}>
                  <label style={{ opacity: !categoryChecked && allChecked ? 0.4 : 1 }}>
                    <input
                      type="checkbox"
                      checked={categoryChecked}
                      onChange={() => toggleCategory(source, category)}
                    />
                    {String(category)}
                  </label>

                  {events.map((eventName) => {
                    const eventChecked = isEventChecked(source, eventName)
                    const includedByParent = allChecked || categoryChecked

                    return (
                      <div key={String(eventName)} style={{ paddingLeft: 24 }}>
                        <label style={{ opacity: !eventChecked && includedByParent ? 0.4 : 1 }}>
                          <input
                            type="checkbox"
                            checked={eventChecked}
                            onChange={() => toggleEvent(source, eventName, category)}
                          />
                          {String(eventName)}
                        </label>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {bindings.length > 0 && filters.length > 0 && (
              <div style={{ paddingLeft: 16, marginTop: 8, borderTop: '1px solid #ccc', paddingTop: 8 }}>
                {filters.map(({ param, values }) => (
                  <div key={param}>
                    <strong>{param}:</strong>{' '}
                    {values.map((value) => (
                      <label key={String(value)} style={{ marginRight: 12 }}>
                        <input
                          type="checkbox"
                          checked={isFilterActive(source, param, value)}
                          onChange={() => toggleFilter(source, param, value)}
                        />
                        {String(value)}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <h3>Subscription Result:</h3>
      <pre>{JSON.stringify(subscriptions, null, 2)}</pre>
    </div>
  )
}

export default SubscriptionTree
