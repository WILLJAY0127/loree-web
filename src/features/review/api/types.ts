/** 与 ReviewScheduling 读模型 / Command 响应一致 */

export interface TodayReviewItem {
  scheduleId: string
  knowledgeId: string
  projectName: string
  content: string
  tags: string[]
  priority: string
  round: number
  isCompleted: boolean
  mastery?: string | null
  completedAt?: string | null
}

export interface TodayReviewListPayload {
  date: string
  totalCount: number
  completedCount: number
  items: TodayReviewItem[]
}

export interface CompleteReviewBody {
  mastery: string
  note?: string
}

export interface CompleteReviewResultBody {
  priorityChanged: boolean
  oldPriority: string | null
  newPriority: string | null
  nextReviewDate: string
}
