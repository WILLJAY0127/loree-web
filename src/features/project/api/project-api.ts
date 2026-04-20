import type { ApiEnvelope } from '@/shared/api/types'
import type { ProjectSummaryRow } from '@/features/project/api/types'
import { httpGet } from '@/shared/api/http'

export function fetchProjectList() {
  return httpGet<ApiEnvelope<ProjectSummaryRow[]>>(`/api/v1/projects`)
}
