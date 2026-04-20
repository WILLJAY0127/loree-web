import type { ApiEnvelope, PagedPayload } from '@/shared/api/types'
import type { TaskBoardRow } from '@/features/task/api/types'
import { httpGet } from '@/shared/api/http'

export type TaskListQueryParams = {
  projectId?: string
  status?: string
  isCarriedOver?: boolean
  page?: number
  size?: number
  sort?: string
}

function toSearchParams(p: TaskListQueryParams): string {
  const q = new URLSearchParams()
  q.set('page', String(p.page ?? 0))
  q.set('size', String(p.size ?? 20))
  if (p.projectId) q.set('projectId', p.projectId)
  if (p.status) q.set('status', p.status)
  if (p.isCarriedOver != null) q.set('isCarriedOver', String(p.isCarriedOver))
  if (p.sort) q.set('sort', p.sort)
  return q.toString()
}

export function fetchTaskList(params: TaskListQueryParams = {}) {
  const qs = toSearchParams(params)
  return httpGet<ApiEnvelope<PagedPayload<TaskBoardRow>>>(`/api/v1/tasks?${qs}`)
}
