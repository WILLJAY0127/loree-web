import type { ApiEnvelope } from '@/shared/api/types'
import type { CreateProjectResponseBody, ProjectSummaryRow, ProjectUpsertBody } from '@/features/project/api/types'
import { httpDelete, httpGet, httpPost, httpPut } from '@/shared/api/http'

export function fetchProjectList() {
  return httpGet<ApiEnvelope<ProjectSummaryRow[]>>(`/api/v1/projects`)
}

export function postProject(body: ProjectUpsertBody) {
  return httpPost<ApiEnvelope<CreateProjectResponseBody>>(`/api/v1/projects`, body)
}

export function putProject(projectId: string, body: ProjectUpsertBody) {
  return httpPut<ApiEnvelope<unknown>>(`/api/v1/projects/${encodeURIComponent(projectId)}`, body)
}

export function deleteProject(projectId: string) {
  return httpDelete<unknown>(`/api/v1/projects/${encodeURIComponent(projectId)}`)
}
