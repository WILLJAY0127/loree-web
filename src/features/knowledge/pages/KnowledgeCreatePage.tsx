import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { postCreateKnowledge } from '@/features/knowledge/api/knowledge-api'
import {
  createKnowledgeFormSchema,
  parseTagsText,
  toCreateKnowledgeBody,
  type CreateKnowledgeFormValues,
} from '@/features/knowledge/schemas'
import { useProjectListQuery } from '@/features/project/hooks/use-project-list-query'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'
import { zodResolverTyped } from '@/shared/form/zod-resolver-typed'

/**
 * 「独立创建知识点」页面（对齐《API 接口设计文档》§S3.1 `POST /api/v1/knowledge`）。
 *
 * <h3>与「任务沉淀」的区别</h3>
 * - 本页面：不关联任何任务，纯个人沉淀，必须选 `projectId`
 * - 任务沉淀：在 `DepositPage` 中，沿用任务的 projectId，调
 *   `POST /api/v1/tasks/{taskId}/deposit/knowledge`（streaming 模式）
 *
 * <h3>角色 / 权限</h3>
 * 后端 `@RequireRole(MIND)`，`X-Current-Role` 头由 {@link httpJson} 自动从
 * `useRoleStore` 注入，前端不再二次校验角色（由后端拒绝即可）。
 *
 * <h3>表单校验分两层</h3>
 * 1. zod schema（{@link createKnowledgeFormSchema}）—— 提交前快速校验
 * 2. 提交时再做 tags 数量校验（zod 不便表达「字符串拆分后数组长度」）
 *
 * <h3>成功后</h3>
 * 失效 `knowledge` query tree（含列表 / 详情），跳转到新建知识点详情页。
 */
export default function KnowledgeCreatePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [sp] = useSearchParams()
  const urlProjectId = sp.get('projectId')?.trim() ?? ''

  const projectsQuery = useProjectListQuery()
  const projects = projectsQuery.data?.data

  const form = useForm<CreateKnowledgeFormValues>({
    resolver: zodResolverTyped(createKnowledgeFormSchema),
    defaultValues: {
      projectId: urlProjectId,
      content: '',
      tagsText: '',
      priority: 'P2',
    },
  })

  const { register, handleSubmit, setValue, setError, formState } = form

  useEffect(() => {
    if (urlProjectId) {
      setValue('projectId', urlProjectId)
    }
  }, [urlProjectId, setValue])

  const mutation = useMutation({
    mutationFn: postCreateKnowledge,
    onSuccess: async (res) => {
      await invalidateAfterCommand(qc, 'knowledgeEdit')
      const id = res.data.knowledgeId
      toast('知识点已创建')
      void navigate(`/knowledge/${id}`)
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '创建失败', { variant: 'destructive' })
    },
  })

  const onSubmit = (values: CreateKnowledgeFormValues) => {
    const tags = parseTagsText(values.tagsText)
    if (tags.length < 1 || tags.length > 3) {
      setError('tagsText', { type: 'manual', message: '标签数量需在 1~3 之间' })
      return
    }
    if (tags.some((t) => t.length > 100)) {
      setError('tagsText', { type: 'manual', message: '单个标签不超过 100 字符' })
      return
    }
    mutation.mutate(toCreateKnowledgeBody(values))
  }

  const err = formState.errors

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">知识网络</p>
        <h2 className="text-lg font-semibold tracking-tight">新建知识点</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">仅精神模式 · POST /api/v1/knowledge</p>
      </div>

      <form
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
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
            {...register('projectId')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">请选择</option>
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
          <span>内容 *</span>
          <textarea
            {...register('content')}
            className="min-h-[7rem] rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            maxLength={10000}
            placeholder="一句话描述这个知识点的核心要点"
          />
          {err.content?.message ? (
            <span className="text-destructive">{err.content.message}</span>
          ) : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>标签 *（1~3 个，用逗号或空格分隔，每个 ≤ 100 字符）</span>
          <input
            {...register('tagsText')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            placeholder="例如：递归, 函数式, Python"
          />
          {err.tagsText?.message ? (
            <span className="text-destructive">{err.tagsText.message}</span>
          ) : null}
        </label>

        <label className="grid max-w-lg gap-1 text-xs">
          <span>优先级 *</span>
          <select
            {...register('priority')}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="P1">P1（高）</option>
            <option value="P2">P2（中）</option>
            <option value="P3">P3（低）</option>
          </select>
          {err.priority?.message ? (
            <span className="text-destructive">{err.priority.message}</span>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={mutation.isPending || !projects?.length}>
            创建知识点
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/knowledge">取消</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
