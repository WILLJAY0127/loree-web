import { useQuery } from '@tanstack/react-query'
import { fetchProjectList } from '@/features/project/api/project-api'
import { projectKeys } from '@/shared/query/query-keys'

/** 全量项目列表（筛选下拉、项目页等共用），与 `projectKeys.list({ scope: 'all' })` 对齐。 */
export function useProjectListQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.list({ scope: 'all' }),
    queryFn: () => fetchProjectList(),
    enabled: options?.enabled ?? true,
  })
}
