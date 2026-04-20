import type { ApiEnvelope, PagedPayload } from '@/shared/api/types'
import type { CreateTaskBody, CreateTaskResponseBody, TaskBoardRow, TaskDetail, UpdateTaskBody } from '@/features/task/api/types'
import { httpGet, httpPost, httpPut } from '@/shared/api/http'

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

export function fetchTaskDetail(taskId: string) {
  return httpGet<ApiEnvelope<TaskDetail>>(`/api/v1/tasks/${encodeURIComponent(taskId)}`)
}

export function postTask(body: CreateTaskBody) {
  return httpPost<ApiEnvelope<CreateTaskResponseBody>>(`/api/v1/tasks`, body)
}

export function putTask(taskId: string, body: UpdateTaskBody) {
  return httpPut<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}`, body)
}

export function postTaskStart(taskId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}/start`, {})
}

export function postTaskSubmit(taskId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}/submit`, {})
}

export function postTaskApprove(taskId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}/approve`, {})
}

export function postTaskReject(taskId: string, reason: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}/reject`, {
    reason,
  })
}

export function postTaskRestart(taskId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}/restart`, {})
}

export type TaskCommandOp =
  | { op: 'start' }
  | { op: 'submit' }
  | { op: 'approve' }
  | { op: 'reject'; reason: string }
  | { op: 'restart' }

export function executeTaskCommand(taskId: string, cmd: TaskCommandOp) {
  switch (cmd.op) {
    case 'start':
      return postTaskStart(taskId)
    case 'submit':
      return postTaskSubmit(taskId)
    case 'approve':
      return postTaskApprove(taskId)
    case 'reject':
      return postTaskReject(taskId, cmd.reason)
    case 'restart':
      return postTaskRestart(taskId)
  }
}
