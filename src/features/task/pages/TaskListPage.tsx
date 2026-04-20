import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchTaskList, type TaskListQueryParams } from '@/features/task/api/task-api'
import { fetchProjectList } from '@/features/project/api/project-api'
import { projectKeys, taskKeys } from '@/shared/query/query-keys'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'
import { TaskListToolbar } from '@/features/task/components/task-list-toolbar'

const PAGE_SIZE = 20

export default function TaskListPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [projectId, setProjectId] = useState('')
  const [carriedOnly, setCarriedOnly] = useState(false)

  const listParams: TaskListQueryParams = useMemo(() => {
    const p: TaskListQueryParams = { page, size: PAGE_SIZE }
    if (status) p.status = status
    if (projectId.trim()) p.projectId = projectId.trim()
    if (carriedOnly) p.isCarriedOver = true
    return p
  }, [page, status, projectId, carriedOnly])

  useEffect(() => {
    setPage(0)
  }, [status, projectId, carriedOnly])

  const projectsQuery = useQuery({
    queryKey: projectKeys.list({ scope: 'all' }),
    queryFn: () => fetchProjectList(),
  })

  const projects = projectsQuery.data?.data

  const query = useQuery({
    queryKey: taskKeys.list(listParams),
    queryFn: () => fetchTaskList(listParams),
  })

  const rows = query.data?.data.content
  const pageInfo = query.data?.data
  const isEmpty = query.isSuccess && rows !== undefined && rows.length === 0
  const isRefreshing = query.isFetching && !query.isPending

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">任务</p>
        <h2 className="text-lg font-semibold tracking-tight">任务列表</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">GET /api/v1/tasks · 筛选与分页 · 刷新</p>
      </div>

      <TaskListToolbar
        status={status}
        onStatusChange={setStatus}
        projectId={projectId}
        onProjectIdChange={setProjectId}
        carriedOnly={carriedOnly}
        onCarriedOnlyChange={setCarriedOnly}
        projects={projects}
        isRefreshing={isRefreshing}
        onRefresh={() => void query.refetch()}
      />

      <ListQueryShell
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        emptyTitle="暂无任务"
        emptyDescription="可放宽筛选或到项目管理创建任务后再刷新。"
        emptyAction={
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/projects">去项目管理</Link>
          </Button>
        }
      >
        <>
          <ul className="flex flex-col divide-y divide-border px-2 py-1">
            {rows?.map((t) => (
              <li key={t.taskId}>
                <Link
                  to={`/tasks/${t.taskId}`}
                  className="flex flex-col gap-1 px-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{t.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {t.status}
                    </Badge>
                    {t.isCarriedOver ? (
                      <Badge variant="outline" className="text-[10px]">
                        顺延
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{t.projectName}</p>
                </Link>
              </li>
            ))}
          </ul>

          {pageInfo && pageInfo.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
              <span>
                第 {pageInfo.page + 1} / {pageInfo.totalPages} 页 · 共 {pageInfo.totalElements} 条
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  上一页
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pageInfo.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          ) : null}
        </>
      </ListQueryShell>

      <div className="mt-auto border-t p-3">
        <Button type="button" variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link to="/projects">项目管理</Link>
        </Button>
      </div>
    </div>
  )
}
