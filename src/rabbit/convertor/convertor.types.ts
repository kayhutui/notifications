/**
 * Convertor Type Definitions
 *
 * The convertor transforms ecosystem events into UI notifications.
 *
 * EventConfig defines how a single ecosystem event is converted:
 *   eventName:    the ecosystem event to match (e.g. 'instanceFailure')
 *   source:       the ecosystem TopicRouteConfig to subscribe to
 *   subscribeWith: partial source params for the subscription routing key
 *   destinations: array of UI route configs to publish to (topic + headers exchanges)
 *   staticValues: fixed destination param values (e.g. { category: 'failure', active: true })
 *   dynamicValues: destination param → key in raw event data (e.g. { operation: 'operationId' })
 *   getMeta:      builds message metadata from resolved destination values (e.g. notification title)
 *
 * ConvertorMap is a mapped type structured as:
 *   CONVERTOR_MAP[exchange][source] → EventConfig[]
 * The `satisfies` constraint enforces that map keys match inner config exchange/source values.
 */
import type { _Rabbit } from '../rabbit/rabbit.types.ts'

export declare namespace _Convertor {
  export interface EventConfig<SourceParam extends string = string, DestParam extends string = string> {
    /** Ecosystem event name to match against incoming events */
    eventName: string
    /** Ecosystem route config — defines the exchange/source to subscribe to */
    source: _Rabbit.TopicRouteConfig<SourceParam>
    /** Partial source param values for building the subscription routing key */
    subscribeWith: Partial<Record<SourceParam, string>>
    /** UI route configs to publish converted messages to (topic and/or headers exchanges) */
    destinations: (_Rabbit.TopicRouteConfig<DestParam> | _Rabbit.HeadersRouteConfig<DestParam>)[]
    /** Fixed destination param values applied to every conversion (e.g. category, active) */
    staticValues: Partial<Record<DestParam, string | boolean>>
    /** Maps destination params to keys in the raw ecosystem event data object */
    dynamicValues: Partial<Record<DestParam, string>>
    /** Builds message metadata (e.g. notification title) from the resolved destination values */
    getMeta: (params: Partial<Record<DestParam, string | boolean>>) => Record<string, unknown>
  }

  /** Mapped type: exchange key and source key must match the inner source config */
  export type ConvertorMap<
    Source extends string,
    SourceParam extends string = string,
    DestParam extends string = string,
  > = {
    [Exchange in _Rabbit.RabbitExchangeName]?: {
      [Src in Source]?: (EventConfig<SourceParam, DestParam> & {
        source: { exchange: Exchange; source: Src }
      })[]
    }
  }
}
