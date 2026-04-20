/** 与后端 `ApiResponse` 对齐的最小信封（成功场景）。 */
export interface ApiEnvelope<T> {
  code: number
  data: T
  timestamp?: string
}

/** Spring Data 风格分页（与 API 文档列表响应一致）。 */
export interface PagedPayload<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
