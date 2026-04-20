/** 与后端 `ApiResponse` 对齐的最小信封（成功场景）。 */
export interface ApiEnvelope<T> {
  code: number
  data: T
  timestamp?: string
}
