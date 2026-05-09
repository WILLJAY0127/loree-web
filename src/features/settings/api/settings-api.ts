import type { ApiEnvelope } from '@/shared/api/types'
import type { UpdateUserSettingsBody, UserSettingsPayload } from '@/features/settings/api/types'
import { httpGet, httpPut } from '@/shared/api/http'

export function fetchSettings() {
  return httpGet<ApiEnvelope<UserSettingsPayload>>('/api/v1/settings')
}

export function putSettings(body: UpdateUserSettingsBody) {
  return httpPut<ApiEnvelope<unknown>>('/api/v1/settings', body)
}
