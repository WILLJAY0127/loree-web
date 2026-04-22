import { useQuery } from '@tanstack/react-query'
import { fetchTodayReviews } from '@/features/review/api/review-api'
import { reviewKeys } from '@/shared/query/query-keys'

export function useTodayReviewsQuery() {
  return useQuery({
    queryKey: reviewKeys.today(),
    queryFn: () => fetchTodayReviews(),
  })
}
