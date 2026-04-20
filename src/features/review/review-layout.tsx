import { Outlet } from 'react-router-dom'
import { RoleGuard } from '@/shared/components/RoleGuard'

export function ReviewLayout() {
  return (
    <RoleGuard role="BODY">
      <Outlet />
    </RoleGuard>
  )
}
