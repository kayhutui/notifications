import { z } from 'zod'
import { UI_EVENTS, UI_CONVERTED_EVENTS, UI_CATEGORIES, UI_ACTIONS } from './ui.consts.ts'
import { instanceFailureEventSchema, instanceSuccessEventSchema } from '../ecosystem/ecosystem.schemas.ts'

// ──── Target Data Schema ────
export const uiTargetDataSchema = z
  .object({
    targetId: z.string(),
  })
  .catchall(z.unknown())

// ──── Base UI Event Schema ────
export const baseUIEventSchema = z.object({
  eventId: z.string(),
  targetType: z.string(),
  targetData: uiTargetDataSchema,
  category: z.string(),
  action: z.string(),
  subject: z.literal('NOTIFICATION'),
  dispatcher: z.string(),
  data: z.unknown(),
})

// ──── UI Event Schema Factory ────
export const getUIEventSchema = <EventId extends string, Category extends string, Action extends string>(
  eventId: EventId,
  category: Category,
  action: Action,
) =>
  baseUIEventSchema.extend({
    eventId: z.literal(eventId),
    category: z.literal(category),
    action: z.literal(action),
  })

// ──── User Event Schemas ────
export const userCreatedEventSchema = getUIEventSchema(UI_EVENTS.USER_CREATED, UI_CATEGORIES.INFO, UI_ACTIONS.CREATE)

export const userUpdatedEventSchema = getUIEventSchema(UI_EVENTS.USER_UPDATED, UI_CATEGORIES.INFO, UI_ACTIONS.UPDATE)

// ──── Converted Event Schemas ────
export const instanceCreateFailedEventSchema = getUIEventSchema(
  UI_CONVERTED_EVENTS.INSTANCE_CREATE_FAILED,
  UI_CATEGORIES.FAILED,
  UI_ACTIONS.CREATE,
).extend({
  data: instanceFailureEventSchema,
})

export const instanceCreateSuccessEventSchema = getUIEventSchema(
  UI_CONVERTED_EVENTS.INSTANCE_CREATE_SUCCESS,
  UI_CATEGORIES.SUCCESS,
  UI_ACTIONS.CREATE,
).extend({
  data: instanceSuccessEventSchema,
})
