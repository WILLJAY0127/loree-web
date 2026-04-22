import type { ApiEnvelope, PagedPayload } from '@/shared/api/types'
import type {
  CreateKnowledgeResponseBody,
  DepositKnowledgeBody,
  EditKnowledgeContentBody,
  EditKnowledgePriorityBody,
  EditKnowledgeTagsBody,
  KnowledgeDetail,
  KnowledgeListItem,
} from '@/features/knowledge/api/types'
import { httpGet, httpPost, httpPut } from '@/shared/api/http'

export type KnowledgeListQueryParams = {
  projectId?: string
  taskId?: string
  priority?: string
  tag?: string
  isArchived?: boolean
  page?: number
  size?: number
}

function toSearchParams(p: KnowledgeListQueryParams): string {
  const q = new URLSearchParams()
  q.set('page', String(p.page ?? 0))
  q.set('size', String(p.size ?? 20))
  if (p.projectId?.trim()) q.set('projectId', p.projectId.trim())
  if (p.taskId?.trim()) q.set('taskId', p.taskId.trim())
  if (p.priority?.trim()) q.set('priority', p.priority.trim())
  if (p.tag?.trim()) q.set('tag', p.tag.trim())
  if (p.isArchived === true) q.set('isArchived', 'true')
  return q.toString()
}

export function fetchKnowledgeList(params: KnowledgeListQueryParams = {}) {
  const qs = toSearchParams(params)
  return httpGet<ApiEnvelope<PagedPayload<KnowledgeListItem>>>(`/api/v1/knowledge?${qs}`)
}

export function fetchKnowledgeDetail(knowledgeId: string) {
  return httpGet<ApiEnvelope<KnowledgeDetail>>(
    `/api/v1/knowledge/${encodeURIComponent(knowledgeId)}`,
  )
}

export function postDepositKnowledge(taskId: string, body: DepositKnowledgeBody) {
  return httpPost<ApiEnvelope<CreateKnowledgeResponseBody>>(
    `/api/v1/tasks/${encodeURIComponent(taskId)}/deposit/knowledge`,
    body,
  )
}

export function postDepositComplete(taskId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/tasks/${encodeURIComponent(taskId)}/deposit/complete`, {})
}

export function putKnowledgeContent(knowledgeId: string, body: EditKnowledgeContentBody) {
  return httpPut<ApiEnvelope<unknown>>(
    `/api/v1/knowledge/${encodeURIComponent(knowledgeId)}/content`,
    body,
  )
}

export function putKnowledgeTags(knowledgeId: string, body: EditKnowledgeTagsBody) {
  return httpPut<ApiEnvelope<unknown>>(`/api/v1/knowledge/${encodeURIComponent(knowledgeId)}/tags`, body)
}

export function putKnowledgePriority(knowledgeId: string, body: EditKnowledgePriorityBody) {
  return httpPut<ApiEnvelope<unknown>>(
    `/api/v1/knowledge/${encodeURIComponent(knowledgeId)}/priority`,
    body,
  )
}

export function postKnowledgeArchive(knowledgeId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/knowledge/${encodeURIComponent(knowledgeId)}/archive`, {})
}

export function postKnowledgeRestore(knowledgeId: string) {
  return httpPost<ApiEnvelope<unknown>>(`/api/v1/knowledge/${encodeURIComponent(knowledgeId)}/restore`, {})
}
