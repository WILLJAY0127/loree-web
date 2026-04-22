import type { ApiEnvelope } from '@/shared/api/types'
import type {
  CompleteReviewBody,
  CompleteReviewResultBody,
  TodayReviewListPayload,
} from '@/features/review/api/types'
import { httpGet, httpPost } from '@/shared/api/http'

export function fetchTodayReviews() {
  return httpGet<ApiEnvelope<TodayReviewListPayload>>('/api/v1/reviews/today')
}

export function postReviewComplete(scheduleId: string, body: CompleteReviewBody) {
  return httpPost<ApiEnvelope<CompleteReviewResultBody>>(
    `/api/v1/reviews/${encodeURIComponent(scheduleId)}/complete`,
    body,
  )
}
