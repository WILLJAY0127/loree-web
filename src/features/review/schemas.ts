import { z } from 'zod'

export const MASTERY_OPTIONS = ['会', '模糊', '不会'] as const

export type MasteryOption = (typeof MASTERY_OPTIONS)[number]

export const completeReviewSchema = z.object({
  mastery: z.enum(MASTERY_OPTIONS, { message: '请选择掌握度' }),
  note: z.string().max(200, '笔记不超过 200 字').optional(),
})

export type CompleteReviewFormValues = z.infer<typeof completeReviewSchema>
