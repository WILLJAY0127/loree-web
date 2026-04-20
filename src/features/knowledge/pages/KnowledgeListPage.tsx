import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProjectListQuery } from '@/features/project/hooks/use-project-list-query'
import { useKnowledgeList } from '@/features/knowledge/hooks/use-knowledge-list'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'
import { useRoleStore } from '@/shared/store/role-store'

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '全部优先级' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
]

const selectClass =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] outline-none'

export default function KnowledgeListPage() {
  const role = useRoleStore((s) => s.currentRole)
  const isMind = role === 'MIND'
  const {
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
    query,
  } = useKnowledgeList()

  const projectsQuery = useProjectListQuery()
  const projects = projectsQuery.data?.data

  const rows = query.data?.data.content
  const pageInfo = query.data?.data
  const isEmpty = query.isSuccess && rows !== undefined && rows.length === 0
  const isRefreshing = query.isFetching && !query.isPending

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">知识</p>
            <h2 className="text-lg font-semibold tracking-tight">知识点</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">GET /api/v1/knowledge · 筛选与分页</p>
          </div>
          {isMind ? (
            <Button type="button" size="sm" asChild>
              <Link to="/knowledge/create">新建</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b bg-muted/20 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="grid min-w-[10rem] flex-1 gap-1 text-xs sm:max-w-[14rem]">
          <span className="text-muted-foreground">项目</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={selectClass}
          >
            <option value="">全部项目</option>
            {projects?.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-[8rem] flex-1 gap-1 text-xs sm:max-w-[10rem]">
          <span className="text-muted-foreground">优先级</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-[8rem] flex-1 gap-1 text-xs sm:max-w-[12rem]">
          <span className="text-muted-foreground">标签（精确）</span>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="单个标签名"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
        </label>
        <label className="grid min-w-[12rem] flex-1 gap-1 text-xs sm:max-w-[16rem]">
          <span className="text-muted-foreground">任务 ID（可选）</span>
          <input
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="UUID"
            className="h-9 rounded-md border border-input bg-background px-2 font-mono text-xs"
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 pb-1 text-xs">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <span>仅已归档</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={isRefreshing}
          onClick={() => void query.refetch()}
        >
          {isRefreshing ? '刷新中…' : '刷新'}
        </Button>
      </div>

      <ListQueryShell
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        emptyTitle="暂无知识点"
        emptyDescription="可放宽筛选；或由任务沉淀 / 精神模式独立创建。"
        emptyAction={
          isMind ? (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/knowledge/create">新建知识点</Link>
            </Button>
          ) : null
        }
      >
        <>
          <ul className="flex flex-col divide-y divide-border px-2 py-1">
            {rows?.map((k) => (
              <li key={k.knowledgeId}>
                <Link
                  to={`/knowledge/${k.knowledgeId}`}
                  className="flex flex-col gap-1 px-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {k.priority}
                    </Badge>
                    {k.isArchived ? (
                      <Badge variant="secondary" className="text-[10px]">
                        已归档
                      </Badge>
                    ) : null}
                    {k.linkCount > 0 ? (
                      <Badge variant="outline" className="text-[10px]">
                        关联 {k.linkCount}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{k.content}</p>
                  <p className="text-xs text-muted-foreground">{k.projectName}</p>
                  {k.tags?.length ? (
                    <p className="text-[11px] text-muted-foreground">标签：{k.tags.join(' · ')}</p>
                  ) : null}
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

      <div className="mt-auto flex flex-wrap gap-2 border-t p-3">
        <Button type="button" variant="ghost" size="sm" className="text-xs" asChild>
          <Link to="/tasks">任务</Link>
        </Button>
        {isMind ? (
          <Button type="button" variant="ghost" size="sm" className="text-xs" asChild>
            <Link to="/knowledge/inspection">巡检</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
