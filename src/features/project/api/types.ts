/** GET /api/v1/projects 数组元素 */
export interface ProjectSummaryRow {
  projectId: string
  name: string
  goal: string
  period: string
  taskCount: number
  doneCount: number
  createdAt: string
}

export interface ProjectUpsertBody {
  name: string
  goal?: string
  period?: string
}

export interface CreateProjectResponseBody {
  projectId: string
}
