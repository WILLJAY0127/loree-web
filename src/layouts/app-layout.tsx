import { Outlet } from 'react-router-dom'
import { TopBar } from '@/layouts/top-bar'
import { BottomNav } from '@/layouts/bottom-nav'
import { useRoleStore } from '@/shared/store/role-store'

export function AppLayout() {
  const role = useRoleStore((s) => s.currentRole)

  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background text-foreground" data-role={role}>
      <TopBar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
