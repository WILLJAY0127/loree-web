import { Outlet, useLocation } from 'react-router-dom'
import { TopBar } from '@/layouts/top-bar'
import { BottomNav } from '@/layouts/bottom-nav'
import { shouldHideBottomNav } from '@/layouts/route-meta'
import { useRoleStore } from '@/shared/store/role-store'
import { useBootStore } from '@/shared/store/boot-store'
import { InitialRoleWelcome } from '@/features/shell/initial-role-welcome'

export function AppLayout() {
  const role = useRoleStore((s) => s.currentRole)
  const welcomeDismissed = useBootStore((s) => s.initialWelcomeDismissed)
  const { pathname } = useLocation()
  const hideNav = shouldHideBottomNav(pathname)

  if (!welcomeDismissed) {
    return <InitialRoleWelcome />
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background text-foreground" data-role={role}>
      <TopBar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
      {hideNav ? null : <BottomNav />}
    </div>
  )
}
