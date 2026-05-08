import { z } from 'zod'
import type { CreateKnowledgeBody } from '@/features/knowledge/api/types'

/**
 * 「独立创建知识点」表单校验（对齐《API 接口设计文档》§S3.1
 * `POST /api/v1/knowledge` 后端 `CreateKnowledgeRequest` 校验规则）。
 *
 * 表单层与后端 DTO 的差异：
 * - tags 在表单里是单行字符串（用户用逗号 / 空格 / 中文逗号分隔），提交前
 *   再 split → trim → 去空 → 去重；交付后端的是 `string[]`
 * - priority 用 `z.enum` 限制为 P1 / P2 / P3，UI 用下拉框
 *
 * 后端的 `KnowledgeContent.MAX_LENGTH = 10000`、tag 项 ≤ 100、tags 数 1~3、
 * priority ∈ {P1, P2, P3}，本 schema 与之等价。
 */
export const createKnowledgeFormSchema = z.object({
  projectId: z.string().uuid('请选择项目'),
  content: z.string().trim().min(1, '内容必填').max(10000, '不超过 10000 字符'),
  tagsText: z
    .string()
    .trim()
    .min(1, '至少 1 个标签'),
  priority: z.enum(['P1', 'P2', 'P3'], { message: '请选择优先级' }),
})

export type CreateKnowledgeFormValues = z.infer<typeof createKnowledgeFormSchema>

const TAG_SPLIT_REGEX = /[,，\s]+/

/** 把单行 "递归, 函数式 Python" 拆成 ["递归", "函数式", "Python"]，去空 + 去重。 */
export function parseTagsText(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const piece of raw.split(TAG_SPLIT_REGEX)) {
    const t = piece.trim()
    if (!t) continue
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

/**
 * 把表单值转后端创建 body。tags 个数 / 单个 tag 长度的边界校验在此函数返回值
 * 之后做（见 `KnowledgeCreatePage`），便于错误信息精确指到 tagsText 字段。
 */
export function toCreateKnowledgeBody(v: CreateKnowledgeFormValues): CreateKnowledgeBody {
  return {
    projectId: v.projectId,
    content: v.content,
    tags: parseTagsText(v.tagsText),
    priority: v.priority,
  }
}
