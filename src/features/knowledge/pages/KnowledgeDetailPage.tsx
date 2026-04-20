import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import { useKnowledgeDetail } from '@/features/knowledge/hooks/use-knowledge-detail'
import { useRoleStore } from '@/shared/store/role-store'

export default function KnowledgeDetailPage() {
  const { id } = useParams()
  const role = useRoleStore((s) => s.currentRole)
  const { knowledgeId, query } = useKnowledgeDetail(id)

  if (!knowledgeId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        缺少知识点 ID
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/knowledge">返回列表</Link>
        </Button>
      </div>
    )
  }

  if (query.isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3 text-xs text-muted-foreground">知识点</div>
        <ListSkeleton rows={6} />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <QueryErrorPanel error={query.error} onRetry={() => void query.refetch()} />
        <Button className="m-4 w-fit" variant="outline" size="sm" asChild>
          <Link to="/knowledge">返回列表</Link>
        </Button>
      </div>
    )
  }

  const k = query.data?.data
  if (!k) return null

  const canEditMind = role === 'MIND' && !k.isArchived

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">知识</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{k.priority}</Badge>
          <Badge variant="outline">{k.projectName}</Badge>
          {k.isArchived ? <Badge variant="secondary">已归档</Badge> : null}
          {k.taskId ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link to={`/tasks/${k.taskId}`}>关联任务</Link>
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground">独立创建</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
        <section className="space-y-2 rounded-lg border bg-card p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">内容</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-card-foreground">{k.content}</p>
        </section>

        <section className="space-y-2 rounded-lg border bg-card p-4">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">标签</h2>
          <p className="text-card-foreground">{k.tags?.length ? k.tags.join(' · ') : '—'}</p>
        </section>

        {k.linkedKnowledge?.length ? (
          <section className="space-y-2 rounded-lg border bg-card p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">关联知识点</h2>
            <ul className="space-y-3">
              {k.linkedKnowledge.map((l) => (
                <li key={l.linkId} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <Link to={`/knowledge/${l.knowledgeId}`} className="text-sm font-medium text-primary hover:underline">
                    查看
                  </Link>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{l.content}</p>
                  {l.tags?.length ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">{l.tags.join(' · ')}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {k.reviewNotes?.length ? (
          <section className="space-y-2 rounded-lg border bg-card p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">复习笔记</h2>
            <ul className="space-y-2 text-xs">
              {k.reviewNotes.map((n, i) => (
                <li key={`${n.date}-${i}`} className="rounded-md bg-muted/40 px-2 py-1.5">
                  <span className="font-medium">{n.date}</span> · {n.mastery}
                  {n.note ? <p className="mt-0.5 text-muted-foreground">{n.note}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">创建</dt>
            <dd className="font-medium">{k.createdAt}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">更新</dt>
            <dd className="font-medium">{k.updatedAt}</dd>
          </div>
          {k.archivedAt ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">归档时间</dt>
              <dd className="font-medium">{k.archivedAt}</dd>
            </div>
          ) : null}
        </dl>

        {canEditMind ? (
          <p className="text-xs text-muted-foreground">
            编辑内容 / 标签 / 优先级 / 归档等入口将在后续接入 Command 与表单。
          </p>
        ) : k.isArchived ? (
          <p className="text-xs text-muted-foreground">已归档知识点只读；恢复需精神模式（后续接 Command）。</p>
        ) : (
          <p className="text-xs text-muted-foreground">身体模式：详情只读；编辑请切换到精神模式（后续接权限与表单）。</p>
        )}

        <Button type="button" variant="outline" size="sm" className="w-fit" asChild>
          <Link to="/knowledge">返回知识点列表</Link>
        </Button>
      </div>
    </div>
  )
}
