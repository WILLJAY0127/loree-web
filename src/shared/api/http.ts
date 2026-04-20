import { useRoleStore } from '@/shared/store/role-store'

const BASE = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const DEFAULT_TIMEOUT_MS = 30_000

export class ApiHttpError extends Error {
  readonly status: number
  readonly bodyText: string | undefined

  constructor(message: string, status: number, bodyText?: string) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.bodyText = bodyText
  }
}

function joinUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  if (!BASE) {
    return path
  }
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/**
 * 最薄一层：fetch + JSON + 默认头 + 超时。
 * 缓存 / 重试交给 TanStack Query；此处不做业务缓存。
 */
export async function httpJson<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers: initHeaders, ...rest } = init
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  const headers = new Headers(initHeaders)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  const method = (rest.method ?? 'GET').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('X-Current-Role', useRoleStore.getState().currentRole)

  try {
    const res = await fetch(joinUrl(path), {
      ...rest,
      headers,
      signal: controller.signal,
    })

    const text = await res.text()
    let json: unknown = null
    if (text) {
      try {
        json = JSON.parse(text) as unknown
      } catch {
        throw new ApiHttpError('响应不是合法 JSON', res.status, text)
      }
    }

    if (!res.ok) {
      const msg =
        json && typeof json === 'object' && json !== null && 'message' in json
          ? String((json as { message: unknown }).message)
          : `HTTP ${res.status}`
      throw new ApiHttpError(msg, res.status, text)
    }

    return json as T
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiHttpError('请求超时', 0)
    }
    throw e
  } finally {
    window.clearTimeout(timer)
  }
}

export function httpGet<T>(path: string, init?: Omit<RequestInit, 'method' | 'body'> & { timeoutMs?: number }) {
  return httpJson<T>(path, { ...init, method: 'GET' })
}

export function httpPost<T>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, 'method' | 'body'> & { timeoutMs?: number },
) {
  return httpJson<T>(path, {
    ...init,
    method: 'POST',
    body: JSON.stringify(body),
  })
}
