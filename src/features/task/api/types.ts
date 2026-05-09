/**
 * 任务看板行 — 对齐 API 文档 GET /tasks content 项。
 *
 * 注：所有标 `?: string | null` 的字段（如 rejectReason）后端默认 Jackson
 * 配置 `serializationInclusion(NON_NULL)`，null 值会被序列化时省略。
 * 前端用 `value ? ... : ...` / `value ?? '—'` 模式兼容三态（undefined/null/string）。
 */
export interface TaskBoardRow {
  taskId: string
  projectId: string
  projectName: string
  title: string
  status: string
  estimatedMinutes: number
  acceptanceCriteria: string
  rejectReason?: string | null
  isCarriedOver: boolean
  createdAt: string
  updatedAt: string
}

/** GET /api/v1/tasks/{id} data */
export interface TaskDetail {
  taskId: string
  projectId: string
  projectName: string
  title: string
  status: string
  estimatedMinutes: number
  acceptanceCriteria: string
  rejectReason?: string | null
  subModule?: string | null
  dueAt?: string | null
  knowledgeCount: number
  createdAt: string
  updatedAt: string
}

/** POST /api/v1/tasks */
export interface CreateTaskBody {
  projectId: string
  title: string
  estimatedMinutes: number
  acceptanceCriteria: string
  subModule?: string
  dueAt?: string
}

/** PUT /api/v1/tasks/{id} — 与创建字段一致，全部可选更新 */
export type UpdateTaskBody = Partial<CreateTaskBody>

export interface CreateTaskResponseBody {
  taskId: string
}
