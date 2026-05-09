import { postRoleSwitch } from '@/features/settings/api/role-api'
import { useRoleStore } from '@/shared/store/role-store'
import { routeBackTarget, routeTitle } from '@/layouts/route-meta'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { openConfirm } from '@/shared/feedback/confirm-store'
import { toast } from '@/shared/feedback/toast-store'
import { ApiHttpError } from '@/shared/api/http'

export function TopBar() {
  const location = useLocation()
  const currentRole = useRoleStore((s) => s.currentRole)
  const setRole = useRoleStore((s) => s.setRole)
  const title = routeTitle(location.pathname)
  const backTo = routeBackTarget(location.pathname)

  const next: 'MIND' | 'BODY' = currentRole === 'MIND' ? 'BODY' : 'MIND'
  const nextLabel = next === 'MIND' ? '精神' : '身体'

  const requestSwitch = () => {
    void openConfirm({
      title: '切换角色',
      description: `切换到「${nextLabel}」模式？`,
      variant: 'default',
      confirmText: '切换',
      cancelText: '取消',
    }).then(async (ok) => {
      if (!ok) return
      try {
        await postRoleSwitch(next)
        setRole(next)
        toast(`已切换到「${nextLabel}」`)
      } catch (e) {
        toast(e instanceof ApiHttpError ? e.message : '切换失败（请先启动后端）', {
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-b bg-card px-4 py-3 text-card-foreground',
        currentRole === 'MIND' ? 'border-violet-300/50' : 'border-emerald-300/50',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
        {backTo ? (
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" asChild>
            <Link to={backTo} aria-label="返回">
              <ChevronLeft className="size-5" aria-hidden />
            </Link>
          </Button>
        ) : null}
        <span
          className="shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium"
          data-role={currentRole}
        >
          {currentRole === 'MIND' ? '🧠 精神' : '💪 身体'}
        </span>
        <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
      </div>
      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={requestSwitch}>
        切换角色
      </Button>
    </header>
  )
}
