/**
 * GET /api/v1/projects 数组元素。
 *
 * 注：`goal` / `period` 实际为 nullable，后端 Jackson 在 null 时会省略字段，
 * 故声明为可选；前端用 `?? ''` / `?? '—'` 兼容。
 */
export interface ProjectSummaryRow {
  projectId: string
  name: string
  goal?: string | null
  period?: string | null
  taskCount: number
  doneCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectUpsertBody {
  name: string
  goal?: string
  period?: string
}

export interface CreateProjectResponseBody {
  projectId: string
}
