import { z } from 'zod'
import type { CreateTaskBody } from '@/features/task/api/types'

export const createTaskFormSchema = z.object({
  projectId: z.string().uuid('请选择项目'),
  title: z.string().trim().min(1, '标题必填').max(500),
  estimatedMinutes: z.coerce.number().int().min(1, '至少 1 分钟').max(120, '不超过 120 分钟'),
  acceptanceCriteria: z.string().trim().min(1, '验收标准必填').max(1000),
  subModule: z.string().max(200),
  dueAt: z.string(),
})

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>

export function toCreateTaskBody(v: CreateTaskFormValues): CreateTaskBody {
  const body: CreateTaskBody = {
    projectId: v.projectId,
    title: v.title,
    estimatedMinutes: v.estimatedMinutes,
    acceptanceCriteria: v.acceptanceCriteria,
  }
  const sm = v.subModule.trim()
  if (sm) body.subModule = sm
  const due = v.dueAt.trim()
  if (due) {
    const d = new Date(due)
    if (!Number.isNaN(d.getTime())) body.dueAt = d.toISOString()
  }
  return body
}
