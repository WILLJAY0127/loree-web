import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/app-layout'
import { RoleGuard } from '@/shared/components/RoleGuard'
import { ReviewLayout } from '@/features/review/review-layout'

import TaskListPage from '@/features/task/pages/TaskListPage'
import TaskDetailPage from '@/features/task/pages/TaskDetailPage'
import ProjectListPage from '@/features/project/pages/ProjectListPage'
import KnowledgeListPage from '@/features/knowledge/pages/KnowledgeListPage'
import KnowledgeDetailPage from '@/features/knowledge/pages/KnowledgeDetailPage'
import DepositPage from '@/features/knowledge/pages/DepositPage'
import KnowledgeCreatePage from '@/features/knowledge/pages/KnowledgeCreatePage'
import InspectionPage from '@/features/knowledge/pages/InspectionPage'
import ReviewListPage from '@/features/review/pages/ReviewListPage'
import ReviewSessionPage from '@/features/review/pages/ReviewSessionPage'
import RetroPage from '@/features/retro/pages/RetroPage'
import StatsPage from '@/features/stats/pages/StatsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'

function Mind({ children }: { children: ReactNode }) {
  return <RoleGuard role="MIND">{children}</RoleGuard>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },

      { path: 'tasks', element: <TaskListPage /> },
      { path: 'tasks/:taskId', element: <TaskDetailPage /> },
      { path: 'projects', element: <ProjectListPage /> },

      {
        path: 'knowledge/create',
        element: (
          <Mind>
            <KnowledgeCreatePage />
          </Mind>
        ),
      },
      {
        path: 'knowledge/inspection',
        element: (
          <Mind>
            <InspectionPage />
          </Mind>
        ),
      },
      {
        path: 'knowledge/deposit/:taskId',
        element: (
          <Mind>
            <DepositPage />
          </Mind>
        ),
      },
      { path: 'knowledge/:id', element: <KnowledgeDetailPage /> },
      { path: 'knowledge', element: <KnowledgeListPage /> },

      {
        path: 'review',
        element: <ReviewLayout />,
        children: [
          { index: true, element: <ReviewListPage /> },
          { path: ':scheduleId', element: <ReviewSessionPage /> },
        ],
      },

      { path: 'retro', element: <RetroPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
