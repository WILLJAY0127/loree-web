import type { ReactNode } from 'react'
import { EmptyState } from '@/shared/components/page-state/empty-state'
import { ListSkeleton } from '@/shared/components/page-state/list-skeleton'
import { QueryErrorPanel } from '@/shared/components/page-state/query-error-panel'

interface ListQueryShellProps {
  isPending: boolean
  isError: boolean
  error: unknown
  /** 在 isSuccess 且 content 长度为 0 时为 true */
  isEmpty: boolean
  onRetry: () => void
  skeletonRows?: number
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
  children: ReactNode
}

/**
 * 列表页统一三态：加载骨架 → 错误重试 → 空态 → 有数据时渲染 children。
 * 阶段 0.2；后续列表页直接包一层即可。
 */
export function ListQueryShell({
  isPending,
  isError,
  error,
  isEmpty,
  onRetry,
  skeletonRows,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}: ListQueryShellProps) {
  if (isPending) {
    return <ListSkeleton rows={skeletonRows} />
  }
  if (isError) {
    return <QueryErrorPanel error={error} onRetry={onRetry} />
  }
  if (isEmpty) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }
  return <>{children}</>
}
