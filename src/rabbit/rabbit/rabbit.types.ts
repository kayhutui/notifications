/**
 * RabbitMQ Core Type Definitions
 *
 * Defines the type system for exchange routing configuration.
 *
 * ExchangeRouteConfig is the base interface for all route configs, with fields:
 *   - exchange:     which RabbitMQ exchange this routes to
 *   - exchangeType: 'topic' | 'headers' (narrows in sub-interfaces)
 *   - source:       first segment of routing key / source identifier (e.g. 'INSTANCE')
 *   - formatter:    ordered list of param names that define the routing key segments
 *   - options:      array of valid param combinations for dependent/hierarchical params (tree)
 *                   e.g. [{ eventName: 'x', category: 'failure' }] — eventName depends on category
 *   - filters:      independent params with predefined values that can be added to any binding
 *                   e.g. { active: [true, false] } — active is independent of category/eventName
 *
 * TopicRouteConfig and HeadersRouteConfig narrow exchangeType for type-safe formatting.
 *
 * ExchangeTopicMap / ExchangeHeadersMap are mapped types used with `as const satisfies`
 * to enforce that the exchange and source keys in the map match the inner config values.
 */
import type { _RabbitExchangeName, _RabbitExchangeType } from './rabbit.consts.ts'
import type { Primitive } from '../utilities.types.ts'

export declare namespace _Rabbit {
  export type RabbitExchangeName = _RabbitExchangeName
  export type RabbitExchangeType = _RabbitExchangeType
  export type RabbitExchangeConfig = { name: RabbitExchangeName; type: RabbitExchangeType }

  export interface ExchangeRouteConfig<Param extends string = string> {
    exchange: RabbitExchangeName
    exchangeType: RabbitExchangeType
    /** Ordered param names forming the routing key segments (after source) */
    formatter: readonly Param[]
    /** Valid dependent param combinations — defines the hierarchical tree structure */
    options?: readonly Partial<Record<Param, Primitive>>[]
    /** Independent filter params — can be added to any subscription binding */
    filters?: Partial<Record<Param, readonly (Primitive)[]>>
    source: string
  }

  export interface TopicRouteConfig<Param extends string = string> extends ExchangeRouteConfig<Param> {
    exchangeType: 'topic'
  }

  export interface HeadersRouteConfig<Param extends string = string> extends ExchangeRouteConfig<Param> {
    exchangeType: 'headers'
  }

  /** Mapped type: exchange key and source key must match the inner config fields */
  export type ExchangeTopicMap<Source extends string, Param extends string = string> = {
    [Exchange in RabbitExchangeName]?: {
      [Src in Source]?: TopicRouteConfig<Param> & { exchange: Exchange; source: Src }
    }
  }

  export type ExchangeHeadersMap<Source extends string, Param extends string = string> = {
    [Exchange in RabbitExchangeName]?: {
      [Src in Source]?: HeadersRouteConfig<Param> & { exchange: Exchange; source: Src }
    }
  }
}
