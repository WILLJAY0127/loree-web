import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteProject, postProject, putProject } from '@/features/project/api/project-api'
import type { ProjectSummaryRow } from '@/features/project/api/types'
import { projectUpsertSchema, toProjectUpsertBody, type ProjectUpsertForm } from '@/features/project/schemas'
import { useProjectListQuery } from '@/features/project/hooks/use-project-list-query'
import { ListQueryShell } from '@/shared/components/page-state/list-query-shell'
import { useRoleStore } from '@/shared/store/role-store'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { toast } from '@/shared/feedback/toast-store'
import { confirmDestructive } from '@/shared/feedback/confirm-destructive'
import { ApiHttpError } from '@/shared/api/http'
import { zodResolverTyped } from '@/shared/form/zod-resolver-typed'

const emptyForm: ProjectUpsertForm = { name: '', goal: '', period: '' }

export default function ProjectListPage() {
  const role = useRoleStore((s) => s.currentRole)
  const qc = useQueryClient()
  const isMind = role === 'MIND'

  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const createForm = useForm<ProjectUpsertForm>({
    resolver: zodResolverTyped(projectUpsertSchema),
    defaultValues: emptyForm,
  })

  const editForm = useForm<ProjectUpsertForm>({
    resolver: zodResolverTyped(projectUpsertSchema),
    defaultValues: emptyForm,
  })

  const query = useProjectListQuery()

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
      createForm.reset(emptyForm)
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
      editForm.reset(emptyForm)
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
    editForm.reset({
      name: p.name,
      goal: p.goal ?? '',
      period: p.period ?? '',
    })
    setShowCreate(false)
  }

  const onSubmitCreate = (data: ProjectUpsertForm) => {
    createMutation.mutate(toProjectUpsertBody(data))
  }

  const onSubmitEdit = (data: ProjectUpsertForm) => {
    if (!editingId) return
    updateMutation.mutate({ id: editingId, body: toProjectUpsertBody(data) })
  }

  const requestDelete = (p: ProjectSummaryRow) => {
    void confirmDestructive(`确定删除项目「${p.name}」？（无关联任务时才可删）`).then((ok) => {
      if (ok) deleteMutation.mutate(p.projectId)
    })
  }

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const createErr = createForm.formState.errors
  const editErr = editForm.formState.errors

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
          <Button
            type="button"
            size="sm"
            variant={showCreate ? 'secondary' : 'outline'}
            onClick={() =>
              setShowCreate((v) => {
                const next = !v
                if (next) createForm.reset(emptyForm)
                return next
              })
            }
          >
            {showCreate ? '收起新建' : '新建项目'}
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link to="/tasks/new">新建任务</Link>
          </Button>
        </div>
      ) : null}

      {isMind && showCreate ? (
        <form
          className="space-y-3 border-b bg-muted/15 px-4 py-3"
          onSubmit={createForm.handleSubmit(onSubmitCreate)}
          noValidate
        >
          <p className="text-xs font-medium text-muted-foreground">新建项目</p>
          <div className="grid max-w-lg gap-2">
            <label className="grid gap-1 text-xs">
              <span>名称 *</span>
              <input
                {...createForm.register('name')}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={200}
              />
              {createErr.name?.message ? <span className="text-destructive">{createErr.name.message}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>目标</span>
              <textarea
                {...createForm.register('goal')}
                className="min-h-[4rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                maxLength={500}
              />
              {createErr.goal?.message ? <span className="text-destructive">{createErr.goal.message}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>周期</span>
              <input
                {...createForm.register('period')}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={100}
              />
              {createErr.period?.message ? <span className="text-destructive">{createErr.period.message}</span> : null}
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy}>
                创建
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCreate(false)
                  createForm.reset(emptyForm)
                }}
              >
                取消
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      {isMind && editingId ? (
        <form
          className="space-y-3 border-b bg-muted/15 px-4 py-3"
          onSubmit={editForm.handleSubmit(onSubmitEdit)}
          noValidate
        >
          <p className="text-xs font-medium text-muted-foreground">编辑项目</p>
          <div className="grid max-w-lg gap-2">
            <label className="grid gap-1 text-xs">
              <span>名称 *</span>
              <input
                {...editForm.register('name')}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={200}
              />
              {editErr.name?.message ? <span className="text-destructive">{editErr.name.message}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>目标</span>
              <textarea
                {...editForm.register('goal')}
                className="min-h-[4rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                maxLength={500}
              />
              {editErr.goal?.message ? <span className="text-destructive">{editErr.goal.message}</span> : null}
            </label>
            <label className="grid gap-1 text-xs">
              <span>周期</span>
              <input
                {...editForm.register('period')}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                maxLength={100}
              />
              {editErr.period?.message ? <span className="text-destructive">{editErr.period.message}</span> : null}
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy}>
                保存
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingId(null)
                  editForm.reset(emptyForm)
                }}
              >
                取消编辑
              </Button>
            </div>
          </div>
        </form>
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
