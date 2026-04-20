import { useQuery } from '@tanstack/react-query'
import { Button, NavBar, Space, Tag } from 'antd-mobile'
import type { ApiEnvelope } from '@/shared/api/types'
import { apiClient } from '@/shared/api/client'
import { useRoleStore } from '@/shared/store/role-store'

interface PingPublicData {
  endpoint: string
  currentRole: string
  serverTime: string
}

export default function HomePage() {
  const currentRole = useRoleStore((s) => s.currentRole)
  const setRole = useRoleStore((s) => s.setRole)

  const ping = useQuery({
    queryKey: ['ping', 'public'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiEnvelope<PingPublicData>>('/api/v1/ping/public')
      return data
    },
  })

  return (
    <div className="min-h-dvh bg-zinc-50">
      <NavBar back={null}>知鹿 Loree</NavBar>
      <div className="space-y-4 p-4">
        <Space wrap align="center">
          <span className="text-sm text-zinc-600">当前角色</span>
          <Button
            size="small"
            color={currentRole === 'MIND' ? 'primary' : 'default'}
            onClick={() => setRole('MIND')}
          >
            MIND
          </Button>
          <Button
            size="small"
            color={currentRole === 'BODY' ? 'primary' : 'default'}
            onClick={() => setRole('BODY')}
          >
            BODY
          </Button>
        </Space>

        <section>
          <h2 className="mb-2 text-sm font-medium text-zinc-700">后端连通</h2>
          <p className="mb-2 text-xs text-zinc-500">GET /api/v1/ping/public（开发环境走 Vite 代理 → localhost:8080）</p>
          {ping.isPending && <Tag color="warning">检测中…</Tag>}
          {ping.isError && (
            <Tag color="danger">失败（请先启动 loree 后端，默认端口 8080）</Tag>
          )}
          {ping.data && (
            <Space direction="vertical">
              <Tag color="success">HTTP 业务码 {ping.data.code}</Tag>
              <span className="text-xs text-zinc-600">
                endpoint: {ping.data.data.endpoint} · serverTime: {ping.data.data.serverTime}
              </span>
            </Space>
          )}
        </section>

        <p className="text-xs leading-relaxed text-zinc-500">
          Phase 5 脚手架：对齐《前端技术架构设计文档》中的技术栈与目录约定（Vite 6 + React 19 + TanStack Query +
          Zustand + Ant Design Mobile + Tailwind v4）。业务页面在 <code className="rounded bg-zinc-200 px-1">src/features/</code>{' '}
          下按 M1/M2/M3 拆分实现即可。
        </p>
      </div>
    </div>
  )
}
