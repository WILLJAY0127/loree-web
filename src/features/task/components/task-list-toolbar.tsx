import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProjectSummaryRow } from '@/features/project/api/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'TODO', label: '待办 TODO' },
  { value: 'IN_PROGRESS', label: '执行中' },
  { value: 'PENDING_REVIEW', label: '待验收' },
  { value: 'PASSED_PENDING_KNOWLEDGE', label: '待沉淀' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'DONE', label: '已完成' },
]

interface TaskListToolbarProps {
  status: string
  onStatusChange: (v: string) => void
  projectId: string
  onProjectIdChange: (v: string) => void
  carriedOnly: boolean
  onCarriedOnlyChange: (v: boolean) => void
  projects: ProjectSummaryRow[] | undefined
  isRefreshing: boolean
  onRefresh: () => void
}

const selectClass =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] outline-none'

export function TaskListToolbar({
  status,
  onStatusChange,
  projectId,
  onProjectIdChange,
  carriedOnly,
  onCarriedOnlyChange,
  projects,
  isRefreshing,
  onRefresh,
}: TaskListToolbarProps) {
  return (
    <div className="space-y-3 border-b bg-muted/20 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">筛选</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} aria-hidden />
          刷新
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">状态</span>
          <select className={selectClass} value={status} onChange={(e) => onStatusChange(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">项目</span>
          <select className={selectClass} value={projectId} onChange={(e) => onProjectIdChange(e.target.value)}>
            <option value="">全部项目</option>
            {projects?.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={carriedOnly}
          onChange={(e) => onCarriedOnlyChange(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <span className="text-muted-foreground">仅显示顺延任务</span>
      </label>
      <p className="text-[11px] leading-snug text-muted-foreground">
        下拉刷新（手势）可在 Capacitor 阶段接入；当前使用「刷新」按钮触发重新请求。
      </p>
    </div>
  )
}
