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
