import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ApiEnvelope } from '@/shared/api/types'
import { httpGet } from '@/shared/api/http'
import { cn } from '@/lib/utils'
import { StubPage } from '@/features/shell/stub-page'
import { toast } from '@/shared/feedback/toast-store'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { confirmDestructive } from '@/shared/feedback/confirm-destructive'
import { useBootStore } from '@/shared/store/boot-store'

interface PingPublicData {
  endpoint: string
  currentRole: string
  serverTime: string
}

export default function SettingsPage() {
  const qc = useQueryClient()
  const resetWelcome = () => {
    useBootStore.setState({ initialWelcomeDismissed: false })
    toast('已重置：下次进入应用壳将再次显示欢迎屏')
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              void invalidateAfterCommand(qc, 'taskReject')
              toast('已调用 invalidate（taskReject）+ Toast 演示')
            }}
          >
            试用 Toast + 失效 API
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void confirmDestructive('这是「危险操作」样式的确认框示例，确定继续？').then((ok) => {
                if (ok) toast('已确认')
              })
            }}
          >
            试用确认框（destructive）
          </Button>
          <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={resetWelcome}>
            重置首次欢迎屏（调试）
          </Button>
        </div>

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
