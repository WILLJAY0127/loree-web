/** 任务看板行 — 对齐 API 文档 GET /tasks content 项。 */
export interface TaskBoardRow {
  taskId: string
  projectId: string
  projectName: string
  title: string
  status: string
  estimatedMinutes: number
  acceptanceCriteria: string
  rejectReason: string | null
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
  rejectReason: string | null
  subModule: string | null
  dueAt: string | null
  knowledgeCount: number
  createdAt: string
  updatedAt: string
}
