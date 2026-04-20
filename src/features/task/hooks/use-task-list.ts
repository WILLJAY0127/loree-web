import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTaskList, type TaskListQueryParams } from '@/features/task/api/task-api'
import { taskKeys } from '@/shared/query/query-keys'

export const TASK_LIST_PAGE_SIZE = 20

/**
 * 任务列表：筛选状态 + 分页参数 + TanStack Query。
 * 页面只负责布局与 `TaskListToolbar` / `ListQueryShell` 组装。
 */
export function useTaskList() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [projectId, setProjectId] = useState('')
  const [carriedOnly, setCarriedOnly] = useState(false)

  const listParams: TaskListQueryParams = useMemo(() => {
    const p: TaskListQueryParams = { page, size: TASK_LIST_PAGE_SIZE }
    if (status) p.status = status
    if (projectId.trim()) p.projectId = projectId.trim()
    if (carriedOnly) p.isCarriedOver = true
    return p
  }, [page, status, projectId, carriedOnly])

  useEffect(() => {
    setPage(0)
  }, [status, projectId, carriedOnly])

  const query = useQuery({
    queryKey: taskKeys.list(listParams),
    queryFn: () => fetchTaskList(listParams),
  })

  return {
    page,
    setPage,
    status,
    setStatus,
    projectId,
    setProjectId,
    carriedOnly,
    setCarriedOnly,
    listParams,
    query,
  }
}
