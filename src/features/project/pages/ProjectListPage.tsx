import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteProject, fetchProjectList, postProject, putProject } from '@/features/project/api/project-api'
import type { ProjectSummaryRow } from '@/features/project/api/types'
import { projectUpsertSchema, toProjectUpsertBody, type ProjectUpsertForm } from '@/features/project/schemas'
import { projectKeys } from '@/shared/query/query-keys'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'
import { useRoleStore } from '@/shared/store/role-store'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { toast } from '@/shared/feedback/toast-store'
import { confirmDestructive } from '@/shared/feedback/confirm-destructive'
import { ApiHttpError } from '@/shared/api/http'

const emptyForm: ProjectUpsertForm = { name: '', goal: '', period: '' }

export default function ProjectListPage() {
  const role = useRoleStore((s) => s.currentRole)
  const qc = useQueryClient()
  const isMind = role === 'MIND'

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<ProjectUpsertForm>(emptyForm)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProjectUpsertForm>(emptyForm)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const query = useQuery({
    queryKey: projectKeys.list({ scope: 'all' }),
    queryFn: () => fetchProjectList(),
  })

  const rows = query.data?.data
  const isEmpty = query.isSuccess && rows !== undefined && rows.length === 0

  const invalidateProjects = async () => {
    await invalidateAfterCommand(qc, 'projectMutate')
  }

  const createMutation = useMutation({
    mutationFn: (body: ReturnType<typeof toProjectUpsertBody>) => postProject(body),
    onSuccess: async () => {
      await invalidateProjects()
      toast('项目已创建')
      setCreateForm(emptyForm)
      setCreateErrors({})
      setShowCreate(false)
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '创建失败', { variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReturnType<typeof toProjectUpsertBody> }) => putProject(id, body),
    onSuccess: async () => {
      await invalidateProjects()
      toast('已保存')
      setEditingId(null)
      setEditErrors({})
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '保存失败', { variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: async () => {
      await invalidateProjects()
      toast('项目已删除')
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '删除失败', { variant: 'destructive' })
    },
  })

  const startEdit = (p: ProjectSummaryRow) => {
    setEditingId(p.projectId)
    setEditForm({
      name: p.name,
      goal: p.goal ?? '',
      period: p.period ?? '',
    })
    setEditErrors({})
    setShowCreate(false)
  }

  const submitCreate = () => {
    const r = projectUpsertSchema.safeParse(createForm)
    if (!r.success) {
      const e: Record<string, string> = {}
      for (const issue of r.error.issues) {
        const k = String(issue.path[0] ?? '_')
        e[k] = issue.message
      }
      setCreateErrors(e)
      return
    }
    setCreateErrors({})
    createMutation.mutate(toProjectUpsertBody(r.data))
  }

  const submitEdit = () => {
    if (!editingId) return
    const r = projectUpsertSchema.safeParse(editForm)
    if (!r.success) {
      const e: Record<string, string> = {}
      for (const issue of r.error.issues) {
        const k = String(issue.path[0] ?? '_')
        e[k] = issue.message
      }
      setEditErrors(e)
      return
    }
    setEditErrors({})
    updateMutation.mutate({ id: editingId, body: toProjectUpsertBody(r.data) })
  }

  const requestDelete = (p: ProjectSummaryRow) => {
    void confirmDestructive(`确定删除项目「${p.name}」？（无关联任务时才可删）`).then((ok) => {
      if (ok) deleteMutation.mutate(p.projectId)
    })
  }

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">项目</p>
        <h2 className="text-lg font-semibold tracking-tight">项目管理</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isMind ? '精神可创建、编辑、删除项目（≤5）。' : '身体只读；需切换到精神模式以管理项目。'}
        </p>
      </div>

      {isMind ? (
        <div className="flex flex-wrap gap-2 border-b px-4 py-2">
          <Button type="button" size="sm" variant={showCreate ? 'secondary' : 'outline'} onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? '收起新建' : '新建项目'}
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/tasks/new">新建任务</Link>
          </Button>
        </div>
      ) : null}

      {isMind && showCreate ? (
        <div className="space-y-3 border-b bg-muted/15 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">新建项目</p>
          <div className="grid max-w-lg gap-2">
            <label className="grid gap-1 text-xs">
              <span>名称 *</span>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={200}
              />
              {createErrors.name ? <span className="text-destructive">{createErrors.name}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>目标</span>
              <textarea
                value={createForm.goal}
                onChange={(e) => setCreateForm((f) => ({ ...f, goal: e.target.value }))}
                className="min-h-[4rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                maxLength={500}
              />
              {createErrors.goal ? <span className="text-destructive">{createErrors.goal}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>周期</span>
              <input
                value={createForm.period}
                onChange={(e) => setCreateForm((f) => ({ ...f, period: e.target.value }))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={100}
              />
              {createErrors.period ? <span className="text-destructive">{createErrors.period}</span> : null}
            </label>
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={busy} onClick={submitCreate}>
                创建
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isMind && editingId ? (
        <div className="space-y-3 border-b bg-muted/15 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">编辑项目</p>
          <div className="grid max-w-lg gap-2">
            <label className="grid gap-1 text-xs">
              <span>名称 *</span>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={200}
              />
              {editErrors.name ? <span className="text-destructive">{editErrors.name}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>目标</span>
              <textarea
                value={editForm.goal}
                onChange={(e) => setEditForm((f) => ({ ...f, goal: e.target.value }))}
                className="min-h-[4rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                maxLength={500}
              />
            </label>
            <label className="grid gap-1 text-xs">
              <span>周期</span>
              <input
                value={editForm.period}
                onChange={(e) => setEditForm((f) => ({ ...f, period: e.target.value }))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={100}
              />
            </label>
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={busy} onClick={submitEdit}>
                保存
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                取消编辑
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ListQueryShell
        isPending={query.isPending}
        isError={query.isError}
        error={query.error}
        isEmpty={isEmpty}
        onRetry={() => void query.refetch()}
        emptyTitle="暂无项目"
        emptyDescription={isMind ? '点击「新建项目」添加第一个学习项目（最多 5 个）。' : '请切换到精神模式后由精神创建项目。'}
      >
        <ul className="flex flex-col divide-y divide-border">
          {rows?.map((p) => (
            <li key={p.projectId} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    任务 {p.doneCount}/{p.taskCount} 已完成
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{p.goal || '—'}</p>
                <p className="text-[11px] text-muted-foreground">周期：{p.period || '—'}</p>
              </div>
              {isMind ? (
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => startEdit(p)}>
                    编辑
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={busy} asChild>
                    <Link to={`/tasks/new?projectId=${encodeURIComponent(p.projectId)}`}>新建任务</Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => requestDelete(p)}
                  >
                    删除
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </ListQueryShell>

      <div className="mt-auto border-t p-3">
        <Button type="button" variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link to="/tasks">返回任务列表</Link>
        </Button>
      </div>
    </div>
  )
}
