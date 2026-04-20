import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchTaskDetail } from '@/features/task/api/task-api'
import { taskKeys } from '@/shared/query/query-keys'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import { useRoleStore } from '@/shared/store/role-store'

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const id = taskId?.trim() ?? ''
  const role = useRoleStore((s) => s.currentRole)

  const query = useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTaskDetail(id),
    enabled: Boolean(id),
  })

  if (!id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        缺少 taskId
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/tasks">返回任务列表</Link>
        </Button>
      </div>
    )
  }

  if (query.isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3">
          <p className="text-xs text-muted-foreground">任务详情</p>
        </div>
        <ListSkeleton rows={5} />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3">
          <p className="text-xs text-muted-foreground">任务详情</p>
        </div>
        <QueryErrorPanel error={query.error} onRetry={() => void query.refetch()} />
        <div className="p-4">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/tasks">返回任务列表</Link>
          </Button>
        </div>
      </div>
    )
  }

  const t = query.data?.data
  if (!t) {
    return null
  }

  const canDeposit = t.status === 'PASSED_PENDING_KNOWLEDGE' && role === 'MIND'

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">任务</p>
        <h2 className="text-lg font-semibold tracking-tight">{t.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{t.status}</Badge>
          <Badge variant="outline">{t.projectName}</Badge>
          {t.knowledgeCount > 0 ? (
            <Badge variant="outline">已关联知识点 {t.knowledgeCount}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 text-sm">
        <section className="space-y-1 rounded-lg border bg-card p-4 text-card-foreground">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">验收标准</h3>
          <p className="whitespace-pre-wrap leading-relaxed">{t.acceptanceCriteria}</p>
        </section>

        {t.rejectReason ? (
          <section className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="text-xs font-medium text-destructive">驳回原因</h3>
            <p className="whitespace-pre-wrap leading-relaxed text-destructive">{t.rejectReason}</p>
          </section>
        ) : null}

        <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">预估时长</dt>
            <dd className="font-medium">{t.estimatedMinutes} 分钟</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">子模块</dt>
            <dd className="font-medium">{t.subModule ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">截止</dt>
            <dd className="font-medium">{t.dueAt ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">更新于</dt>
            <dd className="font-medium">{t.updatedAt}</dd>
          </div>
        </dl>

        {canDeposit ? (
          <Button type="button" variant="default" size="sm" className="w-full sm:w-auto" asChild>
            <Link to={`/knowledge/deposit/${t.taskId}`}>去知识沉淀</Link>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t.status === 'PASSED_PENDING_KNOWLEDGE' && role !== 'MIND'
              ? '当前为身体模式：沉淀入口需切换到精神模式后使用。'
              : null}
          </p>
        )}

        <Button type="button" variant="outline" size="sm" className="w-fit" asChild>
          <Link to="/tasks">返回任务列表</Link>
        </Button>
      </div>
    </div>
  )
}
