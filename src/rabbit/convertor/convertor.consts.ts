/**
 * Convertor Constants
 *
 * - ENRICHED_FIELDS: field names produced by the enrich step
 * - eventConfig: builder that enforces dynamicValues/desiredFields accept only
 *   fields from `fields` + `enrichedFields`, and enrich must return enrichedFields keys
 */
import type { _Convertor } from './convertor.types.ts'
import type { _Ecosystem } from '../ecosystem/ecosystem.types.ts'
import type { _UI } from '../ui/ui.types.ts'

export const ENRICHED_FIELDS = {
  INTEREST_ID: 'interest_id',
} as const

/** Enforces dynamicValues accepts only fields from `fields` + `enrichedFields`, and enrich must return enrichedFields keys */
export const eventConfig = <DataField extends string, EnrichedField extends string = never>(
  config: _Convertor.EventConfig<
    _Ecosystem.EcosystemTopicParam,
    _UI.UiTopicParam,
    _UI.UiParamValueMap,
    NoInfer<DataField>,
    NoInfer<EnrichedField>
  > & {
    fields: Record<string, DataField>
    enrichedFields?: Record<string, EnrichedField>
  },
) => config
