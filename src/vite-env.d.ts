/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 若设置，`fetch` 使用该绝对 baseURL；开发环境通常留空以走 Vite `/api` 代理 */
  readonly VITE_API_BASE_URL: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
