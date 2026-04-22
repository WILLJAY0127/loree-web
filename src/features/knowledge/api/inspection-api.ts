import type { ApiEnvelope } from '@/shared/api/types'
import { httpGet, httpPost } from '@/shared/api/http'

/** GET /api/v1/inspections/current */
export interface InspectionStatusView {
  weekOf: string
  isCompleted: boolean
  lastInspectionAt: string | null
}

export interface InspectionStep1Item {
  knowledgeId: string
  content: string
  tags: string[]
  priority: string
  createdAt: string
}

export interface InspectionStep2Pair {
  fromId: string
  fromContent: string
  toId: string
  toContent: string
  commonTags: string[]
  alreadyLinked: boolean
}

export interface InspectionStep3Item {
  knowledgeId: string
  content: string
  tags: string[]
  priority: string
  linkCount: number
  reason: string
}

export interface InspectionStep4Summary {
  activeCount: number
  archivedCount: number
  linkCount: number
  orphanCount: number
  weekNewCount: number
  weekNewLinkCount: number
}

export function fetchInspectionCurrent() {
  return httpGet<ApiEnvelope<InspectionStatusView>>('/api/v1/inspections/current')
}

export function fetchInspectionStep1() {
  return httpGet<ApiEnvelope<InspectionStep1Item[]>>('/api/v1/inspections/step1')
}

export function fetchInspectionStep2() {
  return httpGet<ApiEnvelope<InspectionStep2Pair[]>>('/api/v1/inspections/step2')
}

export function fetchInspectionStep3() {
  return httpGet<ApiEnvelope<InspectionStep3Item[]>>('/api/v1/inspections/step3')
}

export function fetchInspectionStep4() {
  return httpGet<ApiEnvelope<InspectionStep4Summary>>('/api/v1/inspections/step4')
}

export function postInspectionComplete() {
  return httpPost<ApiEnvelope<unknown>>('/api/v1/inspections/complete', {})
}
