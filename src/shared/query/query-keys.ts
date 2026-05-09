/**
 * TanStack Query key 工厂 — 与《前端技术架构设计文档》S6.3 前缀一致。
 * 列表/详情在 `all` 前缀下细分，便于 `invalidateQueries({ queryKey: taskKeys.all })` 一次失效整棵子树。
 */

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: unknown) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
}

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: unknown) => [...projectKeys.lists(), filters] as const,
}

export const knowledgeKeys = {
  all: ['knowledge'] as const,
  lists: () => [...knowledgeKeys.all, 'list'] as const,
  list: (filters: unknown) => [...knowledgeKeys.lists(), filters] as const,
  details: () => [...knowledgeKeys.all, 'detail'] as const,
  detail: (knowledgeId: string) => [...knowledgeKeys.details(), knowledgeId] as const,
  recommendations: (knowledgeId: string, limit: number) =>
    [...knowledgeKeys.details(), knowledgeId, 'recommendations', limit] as const,
}

export const tagKeys = {
  all: ['tags'] as const,
}

export const inspectionKeys = {
  all: ['inspection'] as const,
  current: () => [...inspectionKeys.all, 'current'] as const,
  step1: () => [...inspectionKeys.all, 'step1'] as const,
  step2: () => [...inspectionKeys.all, 'step2'] as const,
  step3: () => [...inspectionKeys.all, 'step3'] as const,
  step4: () => [...inspectionKeys.all, 'step4'] as const,
}

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: unknown) => [...reviewKeys.lists(), filters] as const,
  today: () => [...reviewKeys.all, 'today'] as const,
}

/** 沉淀入口 / 会话（与文档示例 `['deposit-session']` 对齐） */
export const depositSessionKeys = {
  all: ['deposit-session'] as const,
  byTask: (taskId: string) => [...depositSessionKeys.all, taskId] as const,
}

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
}
