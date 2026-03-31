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
import type { Primitive } from '../utilities.types.ts'

/** Builds a topic routing key: source.param1.param2... (missing values → '*') */
export const formatTopic = <Param extends string>(
  { formatter, source }: _Rabbit.TopicRouteConfig<Param>,
  values: Partial<Record<Param, Primitive>> = {},
  defaultVal: string = ANY,
): string => {
  const topicValues = formatter.map((key) => {
    const { [key]: value = defaultVal } = values
    return String(value)
  })
  return [source, ...topicValues].join('.')
}

/** Builds a headers object: { source, ...definedParams } (undefined values omitted) */
export const formatHeaders = <Param extends string>(
  { formatter, source }: _Rabbit.HeadersRouteConfig<Param>,
  values: Partial<Record<Param, Primitive>> = {},
) => {
  return formatter.reduce<Record<string, Primitive>>(
    (acc, key) => {
      const { [key]: value } = values
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    { source },
  )
}
