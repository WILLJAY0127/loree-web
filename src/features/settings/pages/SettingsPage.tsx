import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ApiEnvelope } from '@/shared/api/types'
import { fetchSettings, putSettings } from '@/features/settings/api/settings-api'
import type { UserSettingsPayload } from '@/features/settings/api/types'
import { INSPECTION_DAY_OPTIONS } from '@/features/settings/api/types'
import { httpGet, ApiHttpError } from '@/shared/api/http'
import { cn } from '@/lib/utils'
import { toast } from '@/shared/feedback/toast-store'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { settingsKeys } from '@/shared/query/query-keys'
import { confirmDestructive } from '@/shared/feedback/confirm-destructive'
import { useBootStore } from '@/shared/store/boot-store'
import { useRoleStore } from '@/shared/store/role-store'

interface PingPublicData {
  endpoint: string
  currentRole: string
  serverTime: string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const MODE = import.meta.env.MODE

const WEEKDAY_LABEL: Record<(typeof INSPECTION_DAY_OPTIONS)[number], string> = {
  MONDAY: '周一',
  TUESDAY: '周二',
  WEDNESDAY: '周三',
  THURSDAY: '周四',
  FRIDAY: '周五',
  SATURDAY: '周六',
  SUNDAY: '周日',
}

export default function SettingsPage() {
  const qc = useQueryClient()
  const role = useRoleStore((s) => s.currentRole)
  const resetWelcome = () => {
    useBootStore.setState({ initialWelcomeDismissed: false })
    toast('已重置：下次进入应用壳将再次显示欢迎屏')
  }

  const ping = useQuery({
    queryKey: ['ping', 'public'],
    queryFn: () => httpGet<ApiEnvelope<PingPublicData>>('/api/v1/ping/public'),
  })

  const settingsQuery = useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: () => fetchSettings(),
  })

  const [draft, setDraft] = useState<UserSettingsPayload | null>(null)

  useEffect(() => {
    const d = settingsQuery.data?.data
    if (d) setDraft(d)
  }, [settingsQuery.data])

  const saveMutation = useMutation({
    mutationFn: putSettings,
    onSuccess: async () => {
      await invalidateAfterCommand(qc, 'settingsMutate')
      toast('设置已保存')
    },
    onError: (e) => {
      toast(e instanceof ApiHttpError ? e.message : '保存失败', { variant: 'destructive' })
    },
  })

  const canEditSettings = role === 'MIND'

  const onSaveSettings = () => {
    if (!draft || !canEditSettings) return
    saveMutation.mutate({
      retroEnabled: draft.retroEnabled,
      statsEnabled: draft.statsEnabled,
      inspectionDay: draft.inspectionDay,
    })
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-card/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">我的</p>
        <h2 className="text-lg font-semibold tracking-tight">设置与工具</h2>
        <p className="mt-1 text-xs text-muted-foreground">角色切换请用顶栏「切换角色」。</p>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <section className="space-y-2 rounded-lg border bg-card p-4 text-sm shadow-xs">
          <h3 className="text-sm font-medium text-card-foreground">运行环境</h3>
          <dl className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap justify-between gap-2">
              <dt>构建模式</dt>
              <dd className="font-mono text-card-foreground">{MODE}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>VITE_API_BASE_URL</dt>
              <dd className="break-all font-mono text-[11px] text-card-foreground">
                {API_BASE || '（未设置，走同源 / Vite 代理）'}
              </dd>
            </div>
          </dl>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            本地开发：后端默认 <span className="font-mono text-card-foreground">localhost:8080</span>
            ，由 Vite <span className="font-mono">proxy</span> 转发到上述 Base。
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4 shadow-xs">
          <h3 className="text-sm font-medium text-card-foreground">P1 入口</h3>
          <p className="text-xs text-muted-foreground">
            复盘与统计为 P1 能力；若后端关闭对应开关，接口可能返回业务码 40301。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/retro">复盘</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/stats">统计</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground shadow-xs">
          <h3 className="text-sm font-medium">后端连通</h3>
          <p className="text-xs text-muted-foreground">GET /api/v1/ping/public</p>
          <div className="flex flex-wrap gap-2">
            {ping.isPending && <Badge variant="secondary">检测中…</Badge>}
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

        <section className="space-y-4 rounded-lg border bg-card p-4 text-sm shadow-xs">
          <div>
            <h3 className="text-sm font-medium text-card-foreground">用户设置</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              GET/PUT <span className="font-mono">/api/v1/settings</span>
              ；保存仅限「精神」模式（与 spec §S5.2 一致）。
            </p>
          </div>

          {settingsQuery.isPending ? (
            <p className="text-xs text-muted-foreground">加载设置…</p>
          ) : settingsQuery.isError ? (
            <p className="text-xs text-destructive">加载失败（请先启动后端）</p>
          ) : draft ? (
            <div className="grid max-w-md gap-4">
              {!canEditSettings ? (
                <p className="rounded-md border border-dashed bg-muted/30 px-2 py-2 text-xs text-muted-foreground">
                  当前为「身体」模式，仅可查看。请用顶栏切换到「精神」后再保存。
                </p>
              ) : null}

              <label className="flex cursor-pointer items-center gap-3 text-xs">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
                  checked={draft.retroEnabled}
                  disabled={!canEditSettings}
                  onChange={(ev) => setDraft((d) => (d ? { ...d, retroEnabled: ev.target.checked } : d))}
                />
                <span>启用复盘模块入口（retroEnabled）</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 text-xs">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
                  checked={draft.statsEnabled}
                  disabled={!canEditSettings}
                  onChange={(ev) => setDraft((d) => (d ? { ...d, statsEnabled: ev.target.checked } : d))}
                />
                <span>启用统计模块入口（statsEnabled）</span>
              </label>

              <label className="grid gap-1 text-xs">
                <span>默认巡检日（inspectionDay）</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                  value={draft.inspectionDay}
                  disabled={!canEditSettings}
                  onChange={(ev) =>
                    setDraft((d) => (d ? { ...d, inspectionDay: ev.target.value } : d))
                  }
                >
                  {INSPECTION_DAY_OPTIONS.map((day) => (
                    <option key={day} value={day}>
                      {WEEKDAY_LABEL[day]}（{day}）
                    </option>
                  ))}
                </select>
              </label>

              <Button
                type="button"
                size="sm"
                className="w-fit"
                disabled={!canEditSettings || saveMutation.isPending}
                onClick={() => void onSaveSettings()}
              >
                {saveMutation.isPending ? '保存中…' : '保存到服务端'}
              </Button>
            </div>
          ) : null}
        </section>

        <section className="space-y-3 rounded-lg border border-dashed p-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">开发调试</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                void invalidateAfterCommand(qc, 'taskReject')
                toast('已调用 invalidate（taskReject）+ Toast 演示')
              }}
            >
              试用 Toast + 失效
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
              试用确认框
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={resetWelcome}>
              重置首次欢迎屏
            </Button>
          </div>
        </section>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          UI 组件位于 <code className="rounded bg-muted px-1 py-0.5 font-mono">src/components/ui</code>
          ；新增可运行 <code className="rounded bg-muted px-1 py-0.5 font-mono">npx shadcn@latest add …</code>。
        </p>
      </div>
    </div>
  )
}
