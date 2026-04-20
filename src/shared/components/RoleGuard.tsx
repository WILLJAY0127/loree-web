import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AppRole } from '@/shared/store/role-store'
import { useRoleStore } from '@/shared/store/role-store'
import { Button } from '@/components/ui/button'

interface RoleGuardProps {
  role: AppRole
  children: ReactNode
  fallback?: ReactNode
}

function DefaultDenied({ required }: { required: AppRole }) {
  const current = useRoleStore((s) => s.currentRole)
  const requiredLabel = required === 'MIND' ? '精神' : '身体'
  const currentLabel = current === 'MIND' ? '精神' : '身体'

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">当前为「{currentLabel}」模式</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          此页面需要「{requiredLabel}」模式。
        </p>
      </div>
      <p className="max-w-sm text-xs text-muted-foreground">
        请使用顶栏右侧「切换角色」切换到「{requiredLabel}」，再打开本页。
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/tasks">返回任务</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/settings">我的（联调与说明）</Link>
        </Button>
      </div>
    </div>
  )
}

export function RoleGuard({ role, children, fallback }: RoleGuardProps) {
  const current = useRoleStore((s) => s.currentRole)

  if (current !== role) {
    return fallback ?? <DefaultDenied required={role} />
  }

  return <>{children}</>
}
