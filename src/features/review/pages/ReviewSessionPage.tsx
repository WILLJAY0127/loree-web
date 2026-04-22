import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { postReviewComplete } from '@/features/review/api/review-api'
import type { TodayReviewItem } from '@/features/review/api/types'
import { useTodayReviewsQuery } from '@/features/review/hooks/use-today-reviews-query'
import { MASTERY_OPTIONS, completeReviewSchema } from '@/features/review/schemas'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import { ApiHttpError } from '@/shared/api/http'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { toast } from '@/shared/feedback/toast-store'
import { cn } from '@/lib/utils'

function findTodayItem(items: TodayReviewItem[] | undefined, scheduleId: string | undefined) {
  if (!scheduleId || !items?.length) return undefined
  return items.find((i) => i.scheduleId === scheduleId)
}

export default function ReviewSessionPage() {
  const { scheduleId } = useParams()
  const qc = useQueryClient()
  const todayQuery = useTodayReviewsQuery()
  const item = useMemo(
    () => findTodayItem(todayQuery.data?.data?.items, scheduleId),
    [todayQuery.data?.data?.items, scheduleId],
  )

  const [flipped, setFlipped] = useState(false)
  const [mastery, setMastery] = useState<(typeof MASTERY_OPTIONS)[number] | ''>('')
  const [note, setNote] = useState('')

  const completeMutation = useMutation({
    mutationFn: () => {
      const parsed = completeReviewSchema.safeParse({
        mastery: mastery || undefined,
        note: note.trim() ? note : undefined,
      })
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors.mastery?.[0] ?? parsed.error.message
        return Promise.reject(new Error(first))
      }
      if (!scheduleId) return Promise.reject(new Error('缺少 scheduleId'))
      return postReviewComplete(scheduleId, {
        mastery: parsed.data.mastery,
        note: parsed.data.note,
      })
    },
    onSuccess: async (env) => {
      await invalidateAfterCommand(qc, 'reviewComplete')
      const r = env.data
      if (r.priorityChanged && r.oldPriority && r.newPriority) {
        toast(`优先级已调整：${r.oldPriority} → ${r.newPriority}；下次复习 ${r.nextReviewDate}`)
      } else {
        toast('复习已记录')
      }
      setFlipped(false)
      setMastery('')
      setNote('')
    },
    onError: (e: unknown) => {
      toast(e instanceof ApiHttpError ? e.message : e instanceof Error ? e.message : '提交失败', {
        variant: 'destructive',
      })
    },
  })

  if (!scheduleId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        缺少复习调度 ID
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/review">返回今日复习</Link>
        </Button>
      </div>
    )
  }

  if (todayQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3 text-xs text-muted-foreground">复习作答</div>
        <ListSkeleton rows={5} />
      </div>
    )
  }

  if (todayQuery.isError) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <QueryErrorPanel error={todayQuery.error} onRetry={() => void todayQuery.refetch()} />
        <Button className="mt-4 w-fit" variant="outline" size="sm" asChild>
          <Link to="/review">返回今日复习</Link>
        </Button>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">
          未在今日列表中找到该条复习（可能已过期或已完成移出队列）。
        </p>
        <Button type="button" variant="outline" size="sm" className="w-fit" asChild>
          <Link to="/review">返回今日复习</Link>
        </Button>
      </div>
    )
  }

  const busy = completeMutation.isPending

  if (item.isCompleted) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">已完成</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{item.priority}</Badge>
            <Badge variant="secondary">{item.mastery ?? '—'}</Badge>
            <span className="text-xs text-muted-foreground">{item.projectName}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm">{item.content}</p>
          {item.completedAt ? (
            <p className="mt-2 text-[11px] text-muted-foreground">完成时间：{item.completedAt}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/review">返回今日复习</Link>
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to={`/knowledge/${item.knowledgeId}`}>查看知识点</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{item.priority}</Badge>
        <span>{item.projectName}</span>
        <span>第 {item.round} 轮</span>
      </div>

      <div className="mx-auto w-full max-w-lg [perspective:1200px]">
        <div
          className={cn(
            'relative min-h-[18rem] transition-transform duration-500 [transform-style:preserve-3d]',
            flipped && '[transform:rotateY(180deg)]',
          )}
        >
          <div className="absolute inset-0 flex flex-col rounded-xl border bg-card p-4 [backface-visibility:hidden]">
            <p className="text-xs text-muted-foreground">尝试回忆要点，准备好后翻转查看全文。</p>
            <p className="mt-3 line-clamp-6 flex-1 whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
            {item.tags?.length ? (
              <p className="mt-2 text-[11px] text-muted-foreground">{item.tags.join(' · ')}</p>
            ) : null}
            <Button type="button" className="mt-4 w-fit shrink-0" size="sm" onClick={() => setFlipped(true)}>
              翻转
            </Button>
          </div>

          <div className="absolute inset-0 flex flex-col rounded-xl border bg-card p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">背面 · 对照作答</p>
            <p className="mt-2 max-h-[36vh] min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
              {item.content}
            </p>
            <p className="mt-3 shrink-0 text-xs text-muted-foreground">掌握度</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {MASTERY_OPTIONS.map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={mastery === m ? 'default' : 'outline'}
                  disabled={busy}
                  onClick={() => setMastery(m)}
                >
                  {m}
                </Button>
              ))}
            </div>
            <label className="mt-3 grid shrink-0 gap-1 text-xs">
              <span>复习笔记（可选，≤200 字）</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={3}
                disabled={busy}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </label>
            <div className="mt-3 flex shrink-0 flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setFlipped(false)}>
                翻回正面
              </Button>
              <Button type="button" size="sm" disabled={busy || !mastery} onClick={() => completeMutation.mutate()}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/review">返回列表</Link>
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to={`/knowledge/${item.knowledgeId}`}>知识点详情</Link>
        </Button>
      </div>
    </div>
  )
}
