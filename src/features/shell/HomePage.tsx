import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ApiEnvelope } from '@/shared/api/types'
import { httpGet } from '@/shared/api/http'
import { useRoleStore } from '@/shared/store/role-store'
import { cn } from '@/lib/utils'

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
    queryFn: () => httpGet<ApiEnvelope<PingPublicData>>('/api/v1/ping/public'),
  })

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b bg-card px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">知鹿 Loree</h1>
        <p className="text-xs text-muted-foreground">Phase 5 · shadcn/ui 风格组件（源码在仓库内，可直接改）</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">当前角色</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={currentRole === 'MIND' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRole('MIND')}
            >
              MIND
            </Button>
            <Button
              type="button"
              variant={currentRole === 'BODY' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRole('BODY')}
            >
              BODY
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground shadow-xs">
          <h2 className="text-sm font-medium">后端连通</h2>
          <p className="text-xs text-muted-foreground">
            GET /api/v1/ping/public（开发环境走 Vite 代理 → localhost:8080）
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
          UI：Radix Slot + tailwind-merge + CVA（shadcn 惯例），组件位于{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">src/components/ui</code>。新增组件可运行{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">npx shadcn@latest add …</code>（需已配置{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">components.json</code>）。业务页放在{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">src/features/</code>。
        </p>
      </main>
    </div>
  )
}
