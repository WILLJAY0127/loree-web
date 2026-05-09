import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProjectListQuery } from '@/features/project/hooks/use-project-list-query'
import { fetchTaskDetail, putTask } from '@/features/task/api/task-api'
import type { UpdateTaskBody } from '@/features/task/api/types'
import { taskKeys } from '@/shared/query/query-keys'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import {
  createTaskFormSchema,
  toCreateTaskBody,
  type CreateTaskFormValues,
} from '@/features/task/schemas'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'
import { zodResolverTyped } from '@/shared/form/zod-resolver-typed'

function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function TaskEditPage() {
  const { taskId } = useParams()
  const id = taskId?.trim() ?? ''
  const navigate = useNavigate()
  const qc = useQueryClient()
  const seededForTaskIdRef = useRef<string | null>(null)

  const detailQuery = useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTaskDetail(id),
    enabled: Boolean(id),
  })

  const projectsQuery = useProjectListQuery()
  const projects = projectsQuery.data?.data

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolverTyped(createTaskFormSchema),
    defaultValues: {
      projectId: '',
      title: '',
      estimatedMinutes: 45,
      acceptanceCriteria: '',
      subModule: '',
      dueAt: '',
    },
  })

  const { register, handleSubmit, reset, formState } = form

  const t = detailQuery.data?.data

  useEffect(() => {
    seededForTaskIdRef.current = null
  }, [id])

  useEffect(() => {
    if (!t || t.status !== 'TODO') return
    if (seededForTaskIdRef.current === id) return
    seededForTaskIdRef.current = id
    reset({
      projectId: t.projectId,
      title: t.title,
      estimatedMinutes: t.estimatedMinutes,
      acceptanceCriteria: t.acceptanceCriteria,
      subModule: t.subModule ?? '',
      dueAt: isoToDatetimeLocal(t.dueAt),
    })
  }, [id, t, reset])

  const mutation = useMutation({
    mutationFn: (body: UpdateTaskBody) => putTask(id, body),
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'taskCreateOrUpdate')
      await qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
      toast('已保存')
      void navigate(`/tasks/${id}`)
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '保存失败', { variant: 'destructive' })
    },
  })

  const onSubmit = (values: CreateTaskFormValues) => {
    mutation.mutate(toCreateTaskBody(values))
  }

  const err = formState.errors

  if (!id) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        缺少任务 ID
        <Button className="mt-2" variant="outline" size="sm" asChild>
          <Link to="/tasks">返回</Link>
        </Button>
      </div>
    )
  }

  if (detailQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3 text-xs text-muted-foreground">编辑任务</div>
        <ListSkeleton rows={4} />
      </div>
    )
  }

  if (detailQuery.isError) {
    return (
      <div className="flex flex-1 flex-col">
        <QueryErrorPanel error={detailQuery.error} onRetry={() => void detailQuery.refetch()} />
        <Button className="m-4 w-fit" variant="outline" size="sm" asChild>
          <Link to="/tasks">返回</Link>
        </Button>
      </div>
    )
  }

  if (!t) return null

  if (t.status !== 'TODO') {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Badge variant="secondary">{t.status}</Badge>
        <p className="text-sm text-muted-foreground">仅「TODO」状态可编辑任务。请从详情页检查当前状态。</p>
        <Button variant="outline" size="sm" className="w-fit" asChild>
          <Link to={`/tasks/${id}`}>返回任务详情</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">任务</p>
        <h2 className="text-lg font-semibold tracking-tight">编辑任务</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">PUT /api/v1/tasks/{'{id}'} · 仅 TODO</p>
      </div>

      <form
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className="grid max-w-lg gap-1 text-xs">
          <span>所属项目 *</span>
          <select
            {...register('projectId')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {projects?.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name}
              </option>
            ))}
          </select>
          {err.projectId?.message ? (
            <span className="text-destructive">{err.projectId.message}</span>
          ) : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>标题 *</span>
          <input
            {...register('title')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            maxLength={500}
          />
          {err.title?.message ? <span className="text-destructive">{err.title.message}</span> : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>预估时长（分钟）*</span>
          <input
            type="number"
            min={1}
            max={120}
            {...register('estimatedMinutes')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
          {err.estimatedMinutes?.message ? (
            <span className="text-destructive">{err.estimatedMinutes.message}</span>
          ) : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>验收标准 *</span>
          <textarea
            {...register('acceptanceCriteria')}
            className="min-h-[6rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            maxLength={1000}
          />
          {err.acceptanceCriteria?.message ? (
            <span className="text-destructive">{err.acceptanceCriteria.message}</span>
          ) : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>子模块（可选）</span>
          <input
            {...register('subModule')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            maxLength={200}
          />
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>截止时间（可选）</span>
          <input
            type="datetime-local"
            {...register('dueAt')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={mutation.isPending}>
            保存修改
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to={`/tasks/${id}`}>取消</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
