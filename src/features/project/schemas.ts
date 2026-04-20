import { z } from 'zod'

export const projectUpsertSchema = z.object({
  name: z.string().trim().min(1, '项目名称必填').max(200),
  goal: z.string().trim().max(500),
  period: z.string().trim().max(100),
})

export type ProjectUpsertForm = z.infer<typeof projectUpsertSchema>

export function toProjectUpsertBody(v: ProjectUpsertForm): { name: string; goal?: string; period?: string } {
  return {
    name: v.name,
    ...(v.goal ? { goal: v.goal } : {}),
    ...(v.period ? { period: v.period } : {}),
  }
}
