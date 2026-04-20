import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { queryClient } from '@/shared/query/query-client'
import { ToastHost } from '@/shared/feedback/toast-host'
import { ConfirmHost } from '@/shared/feedback/confirm-host'

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastHost />
      <ConfirmHost />
    </QueryClientProvider>
  )
}
