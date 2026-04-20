import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchTaskDetail } from '@/features/task/api/task-api'
import { fetchKnowledgeList, postDepositComplete, postDepositKnowledge } from '@/features/knowledge/api/knowledge-api'
import type { DepositKnowledgeBody } from '@/features/knowledge/api/types'
import { taskKeys } from '@/shared/query/query-keys'
import { knowledgeKeys } from '@/shared/query/query-keys'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { confirmDestructive } from '@/shared/feedback/confirm-destructive'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'

const PRIORITY_OPTIONS = ['P1', 'P2', 'P3'] as const

function parseTags(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function DepositPage() {
  const { taskId: rawTaskId } = useParams()
  const taskId = rawTaskId?.trim() ?? ''
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [content, setContent] = useState('')
  const [tagsRaw, setTagsRaw] = useState('')
  const [priority, setPriority] = useState<string>('P2')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const taskQuery = useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTaskDetail(taskId),
    enabled: Boolean(taskId),
  })

  const listParams = useMemo(() => ({ taskId, page: 0, size: 50 }), [taskId])

  const knowledgeQuery = useQuery({
    queryKey: knowledgeKeys.list(listParams),
    queryFn: () => fetchKnowledgeList(listParams),
    enabled: Boolean(taskId) && taskQuery.isSuccess,
  })

  const task = taskQuery.data?.data
  const rows = knowledgeQuery.data?.data.content

  const depositMutation = useMutation({
    mutationFn: (body: DepositKnowledgeBody) => postDepositKnowledge(taskId, body),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'depositSubmit')
      toast('已沉淀一条知识点')
      setContent('')
      setTagsRaw('')
      setFieldErrors({})
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '沉淀失败', { variant: 'destructive' })
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => postDepositComplete(taskId),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'depositSubmit')
      toast('沉淀已确认，任务将更新为完成')
      void navigate(`/tasks/${taskId}`)
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '操作失败', { variant: 'destructive' })
    },
  })

  const submitDeposit = () => {
    if (!task) return
    const tags = parseTags(tagsRaw)
    if (tags.length < 1 || tags.length > 3) {
      setFieldErrors({ tags: '请填写 1～3 个标签（可用中英文逗号分隔）' })
      return
    }
    const c = content.trim()
    if (!c) {
      setFieldErrors({ content: '请填写知识点内容' })
      return
    }
    if (c.length > 10000) {
      setFieldErrors({ content: '内容不超过 10000 字' })
      return
    }
    setFieldErrors({})
    depositMutation.mutate({
      projectId: task.projectId,
      content: c,
      tags,
      priority,
    })
  }

  const requestComplete = () => {
    const n = rows?.length ?? 0
    const msg =
      n === 0
        ? '当前尚未登记知识点。确认「本次无新知识」并结束沉淀？任务将标记为完成。'
        : `已登记 ${n} 条知识点。确认结束沉淀并完成任务？`
    void confirmDestructive(msg).then((ok) => {
      if (ok) completeMutation.mutate()
    })
  }

  if (!taskId) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        缺少任务 ID
        <Button className="mt-2" variant="outline" size="sm" asChild>
          <Link to="/tasks">返回任务</Link>
        </Button>
      </div>
    )
  }

  if (taskQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3 text-xs text-muted-foreground">知识沉淀</div>
        <ListSkeleton rows={4} />
      </div>
    )
  }

  if (taskQuery.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <QueryErrorPanel error={taskQuery.error} onRetry={() => void taskQuery.refetch()} />
        <Button className="m-4 w-fit" variant="outline" size="sm" asChild>
          <Link to="/tasks">返回任务</Link>
        </Button>
      </div>
    )
  }

  if (!task) return null

  const canDeposit = task.status === 'PASSED_PENDING_KNOWLEDGE'

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">知识</p>
        <h2 className="text-lg font-semibold tracking-tight">沉淀 · {task.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{task.status}</Badge>
          <Badge variant="outline">{task.projectName}</Badge>
        </div>
      </div>

      {!canDeposit ? (
        <div className="space-y-3 p-4 text-sm text-muted-foreground">
          <p>仅当任务处于「待沉淀」状态时可登记知识点。当前状态为 {task.status}。</p>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/tasks/${taskId}`}>返回任务详情</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <section className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
            <p>
              在会话开放期间可登记多条知识点；完成后请点击下方「确认沉淀结束」。无新知识时也须确认，任务才会进入已完成。
            </p>
          </section>

          <div className="grid max-w-lg gap-3">
            <p className="text-xs text-muted-foreground">
              项目：<span className="font-medium text-foreground">{task.projectName}</span>（与任务一致）
            </p>
            <label className="grid gap-1 text-xs">
              <span>优先级</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs">
              <span>标签（1～3 个，逗号分隔）*</span>
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="例：SICP, 环境, 基础"
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              />
              {fieldErrors.tags ? <span className="text-destructive">{fieldErrors.tags}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>知识点内容 *</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[8rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                maxLength={10000}
              />
              {fieldErrors.content ? <span className="text-destructive">{fieldErrors.content}</span> : null}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={depositMutation.isPending || completeMutation.isPending}
                onClick={submitDeposit}
              >
                登记本条
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={completeMutation.isPending || depositMutation.isPending}
                onClick={requestComplete}
              >
                确认沉淀结束
              </Button>
            </div>
          </div>

          <ListQueryShell
            isPending={knowledgeQuery.isPending}
            isError={knowledgeQuery.isError}
            error={knowledgeQuery.error}
            isEmpty={knowledgeQuery.isSuccess && (rows?.length ?? 0) === 0}
            onRetry={() => void knowledgeQuery.refetch()}
            emptyTitle="本会话下暂无已登记知识点"
            emptyDescription="可在上方填写后点击「登记本条」；若确实无新知识，可直接「确认沉淀结束」。"
          >
            <ul className="flex flex-col divide-y divide-border px-2 py-1">
              {rows?.map((k) => (
                <li key={k.knowledgeId} className="px-3 py-2">
                  <Link to={`/knowledge/${k.knowledgeId}`} className="text-sm font-medium text-primary hover:underline">
                    查看详情
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{k.content}</p>
                </li>
              ))}
            </ul>
          </ListQueryShell>

          <Button type="button" variant="outline" size="sm" className="w-fit" asChild>
            <Link to={`/tasks/${taskId}`}>返回任务</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
