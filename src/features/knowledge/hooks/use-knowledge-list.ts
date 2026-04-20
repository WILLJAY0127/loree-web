import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchKnowledgeList, type KnowledgeListQueryParams } from '@/features/knowledge/api/knowledge-api'
import { knowledgeKeys } from '@/shared/query/query-keys'

export const KNOWLEDGE_LIST_PAGE_SIZE = 20

export function useKnowledgeList() {
  const [page, setPage] = useState(0)
  const [projectId, setProjectId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [priority, setPriority] = useState('')
  const [tag, setTag] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)

  const listParams: KnowledgeListQueryParams = useMemo(() => {
    const p: KnowledgeListQueryParams = { page, size: KNOWLEDGE_LIST_PAGE_SIZE }
    if (projectId.trim()) p.projectId = projectId.trim()
    if (taskId.trim()) p.taskId = taskId.trim()
    if (priority.trim()) p.priority = priority.trim()
    if (tag.trim()) p.tag = tag.trim()
    if (includeArchived) p.isArchived = true
    return p
  }, [page, projectId, taskId, priority, tag, includeArchived])

  useEffect(() => {
    setPage(0)
  }, [projectId, taskId, priority, tag, includeArchived])

  const query = useQuery({
    queryKey: knowledgeKeys.list(listParams),
    queryFn: () => fetchKnowledgeList(listParams),
  })

  return {
    page,
    setPage,
    projectId,
    setProjectId,
    taskId,
    setTaskId,
    priority,
    setPriority,
    tag,
    setTag,
    includeArchived,
    setIncludeArchived,
    listParams,
    query,
  }
}
