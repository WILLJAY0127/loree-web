import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { postTask } from '@/features/task/api/task-api'
import { fetchProjectList } from '@/features/project/api/project-api'
import { projectKeys } from '@/shared/query/query-keys'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { createTaskFormSchema, toCreateTaskBody } from '@/features/task/schemas'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'

export default function TaskCreatePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [sp] = useSearchParams()
  const defaultProjectId = sp.get('projectId')?.trim() ?? ''

  const projectsQuery = useQuery({
    queryKey: projectKeys.list({ scope: 'all' }),
    queryFn: () => fetchProjectList(),
  })
  const projects = projectsQuery.data?.data

  const [projectId, setProjectId] = useState(defaultProjectId)
  const [title, setTitle] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('45')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('')
  const [subModule, setSubModule] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: postTask,
    onSuccess: async (res) => {
      await invalidateAfterCommand(qc, 'taskCreateOrUpdate')
      const id = res.data.taskId
      toast('任务已创建')
      void navigate(`/tasks/${id}`)
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '创建失败', { variant: 'destructive' })
    },
  })

  const submit = () => {
    const raw = {
      projectId,
      title,
      estimatedMinutes,
      acceptanceCriteria,
      subModule,
      dueAt,
    }
    const r = createTaskFormSchema.safeParse(raw)
    if (!r.success) {
      const e: Record<string, string> = {}
      for (const issue of r.error.issues) {
        e[String(issue.path[0] ?? '_')] = issue.message
      }
      setFieldErrors(e)
      return
    }
    setFieldErrors({})
    mutation.mutate(toCreateTaskBody(r.data))
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">任务</p>
        <h2 className="text-lg font-semibold tracking-tight">新建任务</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">仅精神模式 · POST /api/v1/tasks</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {!projects?.length ? (
          <p className="text-sm text-muted-foreground">
            暂无项目，请先到
            <Link to="/projects" className="px-1 text-primary underline">
              项目管理
            </Link>
            创建项目。
          </p>
        ) : null}

        <label className="grid max-w-lg gap-1 text-xs">
          <span>所属项目 *</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">请选择</option>
            {projects?.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name}
              </option>
            ))}
          </select>
          {fieldErrors.projectId ? <span className="text-destructive">{fieldErrors.projectId}</span> : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>标题 *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            maxLength={500}
          />
          {fieldErrors.title ? <span className="text-destructive">{fieldErrors.title}</span> : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>预估时长（分钟）*</span>
          <input
            type="number"
            min={1}
            max={120}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
          {fieldErrors.estimatedMinutes ? <span className="text-destructive">{fieldErrors.estimatedMinutes}</span> : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>验收标准 *</span>
          <textarea
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            className="min-h-[6rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            maxLength={1000}
          />
          {fieldErrors.acceptanceCriteria ? (
            <span className="text-destructive">{fieldErrors.acceptanceCriteria}</span>
          ) : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>子模块（可选）</span>
          <input
            value={subModule}
            onChange={(e) => setSubModule(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            maxLength={200}
          />
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>截止时间（可选）</span>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" disabled={mutation.isPending || !projects?.length} onClick={submit}>
            创建任务
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/tasks">取消</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
