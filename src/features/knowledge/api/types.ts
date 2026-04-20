/** 与后端 `KnowledgeListItem` / `KnowledgePageView` 对齐 */

export interface KnowledgeListItem {
  knowledgeId: string
  taskId?: string | null
  projectId: string
  projectName: string
  content: string
  tags: string[]
  priority: string
  linkCount: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface LinkedKnowledgeView {
  knowledgeId: string
  content: string
  tags: string[]
  linkId: string
}

export interface KnowledgeReviewNoteItem {
  date: string
  mastery: string
  note: string
}

export interface KnowledgeDetail {
  knowledgeId: string
  taskId?: string | null
  projectId: string
  projectName: string
  content: string
  tags: string[]
  priority: string
  isArchived: boolean
  linkedKnowledge: LinkedKnowledgeView[]
  reviewNotes: KnowledgeReviewNoteItem[]
  createdAt: string
  updatedAt: string
  archivedAt?: string | null
}
