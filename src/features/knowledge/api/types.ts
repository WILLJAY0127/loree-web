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

/** POST /api/v1/tasks/{taskId}/deposit/knowledge — streaming 沉淀单条 */
export interface DepositKnowledgeBody {
  projectId: string
  content: string
  tags: string[]
  priority: string
}

/** POST /api/v1/knowledge — 独立创建知识点（与 deposit 字段一致）*/
export type CreateKnowledgeBody = DepositKnowledgeBody

export interface CreateKnowledgeResponseBody {
  knowledgeId: string
}

export interface EditKnowledgeContentBody {
  content: string
}

export interface EditKnowledgeTagsBody {
  tags: string[]
}

export interface EditKnowledgePriorityBody {
  priority: string
}

export interface RecommendationItem {
  knowledgeId: string
  content: string
  tags: string[]
  matchReason: string
  commonTags: string[]
}

export interface CreateKnowledgeLinkBody {
  fromId: string
  toId: string
}

export interface CreateKnowledgeLinkResponseBody {
  linkId: string
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
