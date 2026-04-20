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
}

export const tagKeys = {
  all: ['tags'] as const,
}

export const inspectionKeys = {
  all: ['inspection'] as const,
}

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: unknown) => [...reviewKeys.lists(), filters] as const,
}

/** 沉淀入口 / 会话（与文档示例 `['deposit-session']` 对齐） */
export const depositSessionKeys = {
  all: ['deposit-session'] as const,
  byTask: (taskId: string) => [...depositSessionKeys.all, taskId] as const,
}
