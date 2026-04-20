import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import type { ApiEnvelope } from '@/shared/api/types'
import { httpGet } from '@/shared/api/http'
import { cn } from '@/lib/utils'
import { StubPage } from '@/features/shell/stub-page'

interface PingPublicData {
  endpoint: string
  currentRole: string
  serverTime: string
}

export default function SettingsPage() {
  const ping = useQuery({
    queryKey: ['ping', 'public'],
    queryFn: () => httpGet<ApiEnvelope<PingPublicData>>('/api/v1/ping/public'),
  })

  return (
    <StubPage
      title="我的"
      description="设置与 P1 入口占位。角色切换请用顶栏「切换角色」。"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/retro"
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            复盘（P1）
          </Link>
          <Link
            to="/stats"
            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            统计（P1）
          </Link>
        </div>

        <section className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground shadow-xs">
          <h3 className="text-sm font-medium">后端连通</h3>
          <p className="text-xs text-muted-foreground">
            GET /api/v1/ping/public（Vite 代理 → localhost:8080）
          </p>
          <div className="flex flex-wrap gap-2">
            {ping.isPending && <Badge variant="warning">检测中…</Badge>}
            {ping.isError && (
              <Badge variant="destructive">失败（请先启动 loree 后端 :8080）</Badge>
            )}
            {ping.data && (
              <>
                <Badge
                  variant="default"
                  className={cn(ping.data.code === 200 ? 'bg-emerald-600 hover:bg-emerald-600/90' : '')}
                >
                  业务码 {ping.data.code}
                </Badge>
                <span className="w-full text-xs text-muted-foreground">
                  endpoint: {ping.data.data.endpoint} · serverTime: {ping.data.data.serverTime}
                </span>
              </>
            )}
          </div>
        </section>

        <p className="text-xs leading-relaxed text-muted-foreground">
          UI 组件位于 <code className="rounded bg-muted px-1 py-0.5 text-[11px]">src/components/ui</code>
          ；新增可运行 <code className="rounded bg-muted px-1 py-0.5 text-[11px]">npx shadcn@latest add …</code>。
        </p>
      </div>
    </StubPage>
  )
}
