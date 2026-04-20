import { useQuery } from '@tanstack/react-query'
import { fetchKnowledgeDetail } from '@/features/knowledge/api/knowledge-api'
import { knowledgeKeys } from '@/shared/query/query-keys'

export function useKnowledgeDetail(rawId: string | undefined) {
  const id = rawId?.trim() ?? ''

  const query = useQuery({
    queryKey: knowledgeKeys.detail(id),
    queryFn: () => fetchKnowledgeDetail(id),
    enabled: Boolean(id),
  })

  return { knowledgeId: id, query }
}
