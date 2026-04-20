import { NavLink, useLocation } from 'react-router-dom'
import { BookOpen, CheckSquare, Network, Brain, User } from 'lucide-react'
import { useRoleStore } from '@/shared/store/role-store'
import { cn } from '@/lib/utils'

function navClass(isActive: boolean) {
  return cn(
    'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  )
}

export function BottomNav() {
  const role = useRoleStore((s) => s.currentRole)
  const { pathname } = useLocation()

  const tasksActive = pathname === '/tasks' || pathname.startsWith('/tasks/')
  const inspectionActive = pathname.startsWith('/knowledge/inspection')
  const knowledgeTabActive =
    pathname === '/knowledge' ||
    (pathname.startsWith('/knowledge/') && !pathname.startsWith('/knowledge/inspection'))
  const reviewActive = pathname === '/review' || pathname.startsWith('/review/')
  const settingsActive = pathname === '/settings' || pathname.startsWith('/settings')

  return (
    <nav className="flex shrink-0 border-t bg-card pb-[max(env(safe-area-inset-bottom),0.5rem)] text-card-foreground">
      <NavLink to="/tasks" className={() => navClass(tasksActive)}>
        <CheckSquare className="size-5 shrink-0" aria-hidden />
        <span>任务</span>
      </NavLink>
      <NavLink to="/knowledge" className={() => navClass(knowledgeTabActive)}>
        <BookOpen className="size-5 shrink-0" aria-hidden />
        <span>知识</span>
      </NavLink>
      {role === 'MIND' ? (
        <NavLink to="/knowledge/inspection" className={() => navClass(inspectionActive)}>
          <Network className="size-5 shrink-0" aria-hidden />
          <span>巡检</span>
        </NavLink>
      ) : (
        <NavLink to="/review" className={() => navClass(reviewActive)}>
          <Brain className="size-5 shrink-0" aria-hidden />
          <span>复习</span>
        </NavLink>
      )}
      <NavLink to="/settings" className={() => navClass(settingsActive)}>
        <User className="size-5 shrink-0" aria-hidden />
        <span>我的</span>
      </NavLink>
    </nav>
  )
}
