import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchTaskList } from '@/features/task/api/task-api'
import { taskKeys } from '@/shared/query/query-keys'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'

const LIST_PARAMS = { page: 0, size: 20 } as const

export default function TaskListPage() {
  const query = useQuery({
    queryKey: taskKeys.list(LIST_PARAMS),
    queryFn: () => fetchTaskList(LIST_PARAMS),
  })

  const rows = query.data?.data.content
  const isEmpty = query.isSuccess && rows !== undefined && rows.length === 0

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">任务</p>
        <h2 className="text-lg font-semibold tracking-tight">任务列表</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">GET /api/v1/tasks · 阶段 0.2 列表三态</p>
      </div>

      <ListQueryShell
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        emptyTitle="暂无任务"
        emptyDescription="创建任务或调整筛选后刷新；也可先到项目管理创建项目。"
        emptyAction={
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/projects">去项目管理</Link>
          </Button>
        }
      >
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
      </ListQueryShell>

      <div className="mt-auto border-t p-3">
        <Button type="button" variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link to="/projects">项目管理</Link>
        </Button>
      </div>
    </div>
  )
}
