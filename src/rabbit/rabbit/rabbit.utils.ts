/**
 * RabbitMQ Routing Utilities
 *
 * formatTopic:   Builds a dot-separated routing key from a TopicRouteConfig and values.
 *                Missing values become '*' (ANY wildcard).
 *                Example: source=INSTANCE, formatter=[eventName, operation, category]
 *                  values={ category: 'failure' } → "INSTANCE.*.*.failure"
 *
 * formatHeaders: Builds a headers object from a HeadersRouteConfig and values.
 *                Only includes params that have defined values. Always includes { source }.
 *                Example: source=INSTANCE, values={ category: 'failure', active: true }
 *                  → { source: 'INSTANCE', category: 'failure', active: true }
 */
import { ANY } from './rabbit.consts.ts'
import type { _Rabbit } from './rabbit.types.ts'

/** Builds a topic routing key: source.param1.param2... (missing values → '*') */
export const formatTopic = <Param extends string>(
  { formatter, source }: _Rabbit.TopicRouteConfig<Param>,
  values: Partial<Record<Param, string | boolean>> = {},
): string => {
  const segments = formatter.map((key) => {
    const { [key]: value } = values
    // todo: check isEmpty
    return String(value) || ANY
  })
  return [source, ...segments].join('.')
}

/** Builds a headers object: { source, ...definedParams } (undefined values omitted) */
export const formatHeaders = <Param extends string>(
  { formatter, source }: _Rabbit.HeadersRouteConfig<Param>,
  values: Partial<Record<Param, string | boolean>> = {},
) => {
  const defined = formatter
    .filter((key) => {
      const { [key]: value } = values
      return value !== undefined
    })
    .map((key) => {
      const { [key]: value } = values
      return { [key]: value }
    })

  return Object.assign({ source }, ...defined)
}
