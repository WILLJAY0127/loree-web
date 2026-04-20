import { useRoleStore } from '@/shared/store/role-store'
import { routeTitle } from '@/layouts/route-title'
import { Button } from '@/components/ui/button'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function TopBar() {
  const location = useLocation()
  const currentRole = useRoleStore((s) => s.currentRole)
  const setRole = useRoleStore((s) => s.setRole)
  const title = routeTitle(location.pathname)

  const next: 'MIND' | 'BODY' = currentRole === 'MIND' ? 'BODY' : 'MIND'
  const nextLabel = next === 'MIND' ? '精神' : '身体'

  const requestSwitch = () => {
    if (window.confirm(`切换到「${nextLabel}」模式？`)) {
      setRole(next)
    }
  }

  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-b bg-card px-4 py-3 text-card-foreground',
        currentRole === 'MIND' ? 'border-violet-300/50' : 'border-emerald-300/50',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
