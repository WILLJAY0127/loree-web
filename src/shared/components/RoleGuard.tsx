import type { ReactNode } from 'react'
import type { AppRole } from '@/shared/store/role-store'
import { useRoleStore } from '@/shared/store/role-store'

interface RoleGuardProps {
  role: AppRole
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ role, children, fallback }: RoleGuardProps) {
  const current = useRoleStore((s) => s.currentRole)

  if (current !== role) {
    return (
      fallback ?? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-medium text-foreground">当前为「{current === 'MIND' ? '精神' : '身体'}」模式</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            此页面需要「{role === 'MIND' ? '精神' : '身体'}」模式。请用顶栏切换角色后再试。
          </p>
        </div>
      )
    )
  }

  return <>{children}</>
}
