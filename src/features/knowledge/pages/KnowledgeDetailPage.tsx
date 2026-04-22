import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import {
  deleteKnowledgeLink,
  fetchKnowledgeRecommendations,
  postKnowledgeArchive,
  postKnowledgeLink,
  postKnowledgeRestore,
  putKnowledgeContent,
  putKnowledgePriority,
  putKnowledgeTags,
} from '@/features/knowledge/api/knowledge-api'
import { useKnowledgeDetail } from '@/features/knowledge/hooks/use-knowledge-detail'
import { knowledgeKeys } from '@/shared/query/query-keys'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { confirmDestructive } from '@/shared/feedback/confirm-destructive'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'
import { useRoleStore } from '@/shared/store/role-store'

const PRIORITY_OPTIONS = ['P1', 'P2', 'P3'] as const
const RECOMMEND_LIMIT = 15

function matchReasonLabel(reason: string): string {
  if (reason === 'COMMON_TAG') return '共同标签'
  if (reason === 'SAME_PROJECT') return '同项目'
  if (reason === 'SAME_TASK') return '同任务'
  return reason
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function KnowledgeDetailPage() {
  const { id } = useParams()
  const role = useRoleStore((s) => s.currentRole)
  const qc = useQueryClient()
  const { knowledgeId, query } = useKnowledgeDetail(id)

  const [editContent, setEditContent] = useState('')
  const [editTagsRaw, setEditTagsRaw] = useState('')
  const [editPriority, setEditPriority] = useState('P2')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const k = query.data?.data

  const recommendationsQuery = useQuery({
    queryKey: knowledgeKeys.recommendations(knowledgeId, RECOMMEND_LIMIT),
    queryFn: () => fetchKnowledgeRecommendations(knowledgeId, RECOMMEND_LIMIT),
    enabled: Boolean(knowledgeId) && role === 'MIND' && k != null && !k.isArchived,
  })

  useEffect(() => {
    if (!k) return
    setEditContent(k.content)
    setEditTagsRaw(k.tags?.join(',') ?? '')
    setEditPriority(k.priority)
    setFieldErrors({})
  }, [k?.knowledgeId, k?.updatedAt, k?.content, k?.tags, k?.priority])

  const onMutationError = (e: unknown) => {
    toast(e instanceof ApiHttpError ? e.message : '操作失败', { variant: 'destructive' })
  }

  const contentMutation = useMutation({
    mutationFn: () => putKnowledgeContent(knowledgeId, { content: editContent.trim() }),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeEdit')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('内容已保存')
    },
    onError: onMutationError,
  })

  const tagsMutation = useMutation({
    mutationFn: (tags: string[]) => putKnowledgeTags(knowledgeId, { tags }),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeEdit')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('标签已更新')
    },
    onError: onMutationError,
  })

  const priorityMutation = useMutation({
    mutationFn: () => putKnowledgePriority(knowledgeId, { priority: editPriority }),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeEdit')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('优先级已更新')
    },
    onError: onMutationError,
  })

  const archiveMutation = useMutation({
    mutationFn: () => postKnowledgeArchive(knowledgeId),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeArchiveOrRestore')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('已归档')
    },
    onError: onMutationError,
  })

  const restoreMutation = useMutation({
    mutationFn: () => postKnowledgeRestore(knowledgeId),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeArchiveOrRestore')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('已恢复')
    },
    onError: onMutationError,
  })

  const linkCreateMutation = useMutation({
    mutationFn: (toId: string) => postKnowledgeLink({ fromId: knowledgeId, toId }),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeLinkChange')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('已建立关联')
    },
    onError: onMutationError,
  })

  const linkDeleteMutation = useMutation({
    mutationFn: (linkId: string) => deleteKnowledgeLink(linkId),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'knowledgeLinkChange')
      await qc.invalidateQueries({ queryKey: knowledgeKeys.detail(knowledgeId) })
      toast('已解除关联')
    },
    onError: onMutationError,
  })

  const saveTags = () => {
    const tags = parseTags(editTagsRaw)
    if (tags.length < 1 || tags.length > 3) {
      setFieldErrors({ tags: '需 1～3 个标签（逗号分隔）' })
      return
    }
    setFieldErrors({})
    tagsMutation.mutate(tags)
  }

  const requestArchive = () => {
    if (!k) return
    void confirmDestructive(`确定归档知识点？将自动断开所有关联。\n${k.content.slice(0, 80)}${k.content.length > 80 ? '…' : ''}`).then((ok) => {
      if (ok) archiveMutation.mutate()
    })
  }

  const requestUnlink = (linkId: string, peerPreview: string) => {
    void confirmDestructive(`确定解除与该知识点的关联？\n${peerPreview.slice(0, 80)}${peerPreview.length > 80 ? '…' : ''}`).then((ok) => {
      if (ok) linkDeleteMutation.mutate(linkId)
    })
  }

  const busy =
    contentMutation.isPending ||
    tagsMutation.isPending ||
    priorityMutation.isPending ||
    archiveMutation.isPending ||
    restoreMutation.isPending ||
    linkCreateMutation.isPending ||
    linkDeleteMutation.isPending

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

  if (!k) return null

  const canEditMind = role === 'MIND' && !k.isArchived
  const canRestoreMind = role === 'MIND' && k.isArchived

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
        {canEditMind ? (
          <section className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">编辑（精神）</h2>
            <label className="grid gap-1 text-xs">
              <span>内容</span>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[8rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                maxLength={10000}
              />
            </label>
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => {
                const c = editContent.trim()
                if (!c) {
                  toast('内容不可为空', { variant: 'destructive' })
                  return
                }
                contentMutation.mutate()
              }}
            >
              保存内容
            </Button>

            <label className="grid gap-1 text-xs">
              <span>标签（1～3 个，逗号分隔）</span>
              <input
                value={editTagsRaw}
                onChange={(e) => setEditTagsRaw(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              />
              {fieldErrors.tags ? <span className="text-destructive">{fieldErrors.tags}</span> : null}
            </label>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={saveTags}>
              保存标签
            </Button>

            <label className="grid gap-1 text-xs">
              <span>优先级</span>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => priorityMutation.mutate()}>
              保存优先级
            </Button>

            <div className="border-t border-border pt-3">
              <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={requestArchive}>
                归档
              </Button>
            </div>
          </section>
        ) : null}

        {canRestoreMind ? (
          <section className="rounded-lg border bg-card p-4">
            <p className="mb-2 text-xs text-muted-foreground">本知识点已归档，可恢复为活跃态（不自动重建关联）。</p>
            <Button type="button" size="sm" variant="default" disabled={busy} onClick={() => restoreMutation.mutate()}>
              恢复
            </Button>
          </section>
        ) : null}

        {role === 'BODY' ? (
          <p className="text-xs text-muted-foreground">身体模式：以下为只读展示。</p>
        ) : null}

        {!canEditMind ? (
          <>
            <section className="space-y-2 rounded-lg border bg-card p-4">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">内容</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-card-foreground">{k.content}</p>
            </section>

            <section className="space-y-2 rounded-lg border bg-card p-4">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">标签</h2>
              <p className="text-card-foreground">{k.tags?.length ? k.tags.join(' · ') : '—'}</p>
            </section>
          </>
        ) : null}

        {k.linkedKnowledge?.length ? (
          <section className="space-y-2 rounded-lg border bg-card p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">关联知识点</h2>
            <ul className="space-y-3">
              {k.linkedKnowledge.map((l) => (
                <li key={l.linkId} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/knowledge/${l.knowledgeId}`} className="text-sm font-medium text-primary hover:underline">
                      查看
                    </Link>
                    {canEditMind ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        disabled={busy}
                        onClick={() => requestUnlink(l.linkId, l.content)}
                      >
                        解除关联
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{l.content}</p>
                  {l.tags?.length ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">{l.tags.join(' · ')}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {canEditMind ? (
          <section className="space-y-3 rounded-lg border bg-card p-4">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">关联推荐</h2>
            {recommendationsQuery.isPending ? (
              <p className="text-xs text-muted-foreground">加载推荐中…</p>
            ) : recommendationsQuery.isError ? (
              <div className="space-y-2">
                <p className="text-xs text-destructive">推荐加载失败</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void recommendationsQuery.refetch()}>
                  重试
                </Button>
              </div>
            ) : !(recommendationsQuery.data?.data?.length ?? 0) ? (
              <p className="text-xs text-muted-foreground">暂无推荐（可尝试补充标签或同项目下的其他知识点）</p>
            ) : (
              <ul className="space-y-3">
                {(recommendationsQuery.data?.data ?? []).map((item) => (
                  <li key={item.knowledgeId} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {matchReasonLabel(item.matchReason)}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        disabled={busy}
                        onClick={() => linkCreateMutation.mutate(item.knowledgeId)}
                      >
                        建立关联
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <Link to={`/knowledge/${item.knowledgeId}`}>打开</Link>
                      </Button>
                    </div>
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{item.content}</p>
                    {item.tags?.length ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">{item.tags.join(' · ')}</p>
                    ) : null}
                    {item.commonTags?.length ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        共同标签：{item.commonTags.join(' · ')}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
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

        <Button type="button" variant="outline" size="sm" className="w-fit" asChild>
          <Link to="/knowledge">返回知识点列表</Link>
        </Button>
      </div>
    </div>
  )
}
