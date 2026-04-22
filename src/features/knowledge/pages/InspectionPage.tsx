import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  fetchInspectionCurrent,
  fetchInspectionStep1,
  fetchInspectionStep2,
  fetchInspectionStep3,
  fetchInspectionStep4,
  postInspectionComplete,
} from '@/features/knowledge/api/inspection-api'
import { inspectionKeys } from '@/shared/query/query-keys'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 0, label: 'Step 1', title: '本周新增' },
  { id: 1, label: 'Step 2', title: '关联推荐' },
  { id: 2, label: 'Step 3', title: '孤岛' },
  { id: 3, label: 'Step 4', title: '网络摘要' },
] as const

function step3ReasonLabel(reason: string): string {
  if (reason === 'NO_LINKS') return '无关联'
  if (reason === 'NO_TAGS') return '无标签'
  return reason
}

export default function InspectionPage() {
  const qc = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)

  const statusQuery = useQuery({
    queryKey: inspectionKeys.current(),
    queryFn: () => fetchInspectionCurrent(),
  })

  const step1Query = useQuery({
    queryKey: inspectionKeys.step1(),
    queryFn: () => fetchInspectionStep1(),
  })

  const step2Query = useQuery({
    queryKey: inspectionKeys.step2(),
    queryFn: () => fetchInspectionStep2(),
  })

  const step3Query = useQuery({
    queryKey: inspectionKeys.step3(),
    queryFn: () => fetchInspectionStep3(),
  })

  const step4Query = useQuery({
    queryKey: inspectionKeys.step4(),
    queryFn: () => fetchInspectionStep4(),
  })

  const completeMutation = useMutation({
    mutationFn: () => postInspectionComplete(),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'inspectionComplete')
      toast('本周巡检已记录（可重复提交，后端幂等）')
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '提交失败', { variant: 'destructive' })
    },
  })

  const status = statusQuery.data?.data
  const busy = completeMutation.isPending

  const refetchAll = () => {
    void statusQuery.refetch()
    void step1Query.refetch()
    void step2Query.refetch()
    void step3Query.refetch()
    void step4Query.refetch()
  }

  if (statusQuery.isError) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <QueryErrorPanel error={statusQuery.error} onRetry={() => void statusQuery.refetch()} />
        <Button className="mt-4 w-fit" variant="outline" size="sm" asChild>
          <Link to="/knowledge">返回知识点</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">知识</p>
        <h2 className="text-lg font-semibold tracking-tight">每周巡检</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">GET /api/v1/inspections/step1~4 · POST /complete</p>
        {status ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">周一起 {status.weekOf}（UTC）</Badge>
            {status.isCompleted ? (
              <Badge variant="secondary">本周已完成</Badge>
            ) : (
              <Badge variant="outline">本周未完成</Badge>
            )}
            {status.lastInspectionAt ? (
              <span className="text-muted-foreground">上次完成：{status.lastInspectionAt}</span>
            ) : (
              <span className="text-muted-foreground">尚无完成记录</span>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1 border-b bg-muted/20 px-2 py-2">
        {STEPS.map((s) => (
          <Button
            key={s.id}
            type="button"
            size="sm"
            variant={activeStep === s.id ? 'secondary' : 'ghost'}
            className={cn('text-xs', activeStep === s.id && 'font-medium')}
            onClick={() => setActiveStep(s.id)}
          >
            {s.label} · {s.title}
          </Button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {activeStep === 0 ? (
          <ListQueryShell
            isPending={step1Query.isPending}
            isError={step1Query.isError}
            error={step1Query.error}
            isEmpty={step1Query.isSuccess && (step1Query.data?.data?.length ?? 0) === 0}
            onRetry={() => void step1Query.refetch()}
            emptyTitle="本周暂无新增知识点"
            emptyDescription="可在任务沉淀或独立创建后，下周再巡检。"
          >
            <ul className="flex flex-col divide-y divide-border">
              {step1Query.data?.data?.map((row) => (
                <li key={row.knowledgeId} className="px-2 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {row.priority}
                    </Badge>
                    <Button variant="link" className="h-auto p-0 text-sm font-medium" asChild>
                      <Link to={`/knowledge/${row.knowledgeId}`}>打开详情</Link>
                    </Button>
                  </div>
                  <p className="mt-1 line-clamp-3 text-sm">{row.content}</p>
                  {row.tags?.length ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">{row.tags.join(' · ')}</p>
                  ) : null}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{row.createdAt}</p>
                </li>
              ))}
            </ul>
          </ListQueryShell>
        ) : null}

        {activeStep === 1 ? (
          <ListQueryShell
            isPending={step2Query.isPending}
            isError={step2Query.isError}
            error={step2Query.error}
            isEmpty={step2Query.isSuccess && (step2Query.data?.data?.length ?? 0) === 0}
            onRetry={() => void step2Query.refetch()}
            emptyTitle="暂无推荐对"
            emptyDescription="本周新增与其它活跃知识点无共同标签，或均已关联。"
          >
            <ul className="flex flex-col gap-3">
              {step2Query.data?.data?.map((pair, i) => (
                <li key={`${pair.fromId}-${pair.toId}-${i}`} className="rounded-lg border bg-card p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">共同标签</p>
                  <p className="text-xs">{pair.commonTags?.length ? pair.commonTags.join(' · ') : '—'}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <Button variant="link" className="h-auto p-0 text-xs" asChild>
                        <Link to={`/knowledge/${pair.fromId}`}>A 侧</Link>
                      </Button>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{pair.fromContent}</p>
                    </div>
                    <div>
                      <Button variant="link" className="h-auto p-0 text-xs" asChild>
                        <Link to={`/knowledge/${pair.toId}`}>B 侧</Link>
                      </Button>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{pair.toContent}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ListQueryShell>
        ) : null}

        {activeStep === 2 ? (
          <ListQueryShell
            isPending={step3Query.isPending}
            isError={step3Query.isError}
            error={step3Query.error}
            isEmpty={step3Query.isSuccess && (step3Query.data?.data?.length ?? 0) === 0}
            onRetry={() => void step3Query.refetch()}
            emptyTitle="暂无孤岛知识点"
            emptyDescription="当前活跃知识点均有关联。"
          >
            <ul className="flex flex-col divide-y divide-border">
              {step3Query.data?.data?.map((row) => (
                <li key={row.knowledgeId} className="px-2 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {row.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {step3ReasonLabel(row.reason)}
                    </Badge>
                    <Button variant="link" className="h-auto p-0 text-sm font-medium" asChild>
                      <Link to={`/knowledge/${row.knowledgeId}`}>详情</Link>
                    </Button>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm">{row.content}</p>
                  <p className="text-[10px] text-muted-foreground">关联数 {row.linkCount}</p>
                </li>
              ))}
            </ul>
          </ListQueryShell>
        ) : null}

        {activeStep === 3 ? (
          <div className="space-y-3">
            {step4Query.isPending ? (
              <p className="text-xs text-muted-foreground">加载摘要…</p>
            ) : step4Query.isError ? (
              <QueryErrorPanel error={step4Query.error} onRetry={() => void step4Query.refetch()} />
            ) : step4Query.data?.data ? (
              <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">活跃知识点</dt>
                  <dd className="font-semibold">{step4Query.data.data.activeCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">已归档</dt>
                  <dd className="font-semibold">{step4Query.data.data.archivedCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">关联数</dt>
                  <dd className="font-semibold">{step4Query.data.data.linkCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">孤岛数</dt>
                  <dd className="font-semibold">{step4Query.data.data.orphanCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">本周新增知识点</dt>
                  <dd className="font-semibold">{step4Query.data.data.weekNewCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">本周新增关联</dt>
                  <dd className="font-semibold">{step4Query.data.data.weekNewLinkCount}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 border-t pt-3">
          <Button type="button" disabled={busy} onClick={() => completeMutation.mutate()}>
            完成本周巡检
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => refetchAll()}>
            刷新本页数据
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link to="/knowledge">返回知识点</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
