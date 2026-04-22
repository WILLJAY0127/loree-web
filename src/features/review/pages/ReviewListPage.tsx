import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTodayReviewsQuery } from '@/features/review/hooks/use-today-reviews-query'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'

export default function ReviewListPage() {
  const query = useTodayReviewsQuery()
  const payload = query.data?.data
  const items = payload?.items ?? []
  const isEmpty = query.isSuccess && items.length === 0

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">复习</p>
        <h2 className="text-lg font-semibold tracking-tight">今日复习</h2>
        {payload ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {payload.date} · 共 {payload.totalCount} 条 · 已完成 {payload.completedCount}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">GET /api/v1/reviews/today · 至多 10 条</p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <ListQueryShell
          isPending={query.isPending}
          isError={query.isError}
          error={query.error}
          isEmpty={isEmpty}
          onRetry={() => void query.refetch()}
          skeletonRows={6}
          emptyTitle="今日暂无复习项"
          emptyDescription="知识点入队后，会按调度出现在这里。"
        >
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.scheduleId} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{item.projectName}</span>
                      {item.isCompleted ? (
                        <Badge variant="secondary" className="text-[10px]">
                          已完成 · {item.mastery ?? '—'}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="line-clamp-3 text-sm text-card-foreground">{item.content}</p>
                    {item.tags?.length ? (
                      <p className="text-[11px] text-muted-foreground">{item.tags.join(' · ')}</p>
                    ) : null}
                    <p className="text-[11px] text-muted-foreground">第 {item.round} 轮</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {item.isCompleted ? (
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link to={`/review/${item.scheduleId}`}>查看</Link>
                      </Button>
                    ) : (
                      <Button type="button" size="sm" asChild>
                        <Link to={`/review/${item.scheduleId}`}>开始复习</Link>
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" asChild>
                      <Link to={`/knowledge/${item.knowledgeId}`}>知识点</Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ListQueryShell>
      </div>
    </div>
  )
}
