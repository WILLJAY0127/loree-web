import { cn } from '@/lib/utils'

interface ListSkeletonProps {
  rows?: number
  className?: string
}

export function ListSkeleton({ rows = 6, className }: ListSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3 p-4', className)} aria-busy="true" aria-label="加载中">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg border border-border bg-muted/50"
        />
      ))}
    </div>
  )
}
