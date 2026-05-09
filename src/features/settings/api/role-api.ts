import type { ApiEnvelope } from '@/shared/api/types'
import type { AppRole } from '@/shared/store/role-store'
import { httpPost } from '@/shared/api/http'

/** POST /api/v1/role/switch — 服务端审计；成功后客户端再更新本地角色与 Header */
export function postRoleSwitch(role: AppRole) {
  return httpPost<ApiEnvelope<{ currentRole: string }>>('/api/v1/role/switch', { role })
}
