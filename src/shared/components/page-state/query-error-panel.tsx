import { ApiHttpError } from '@/shared/api/http'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function messageFromUnknown(error: unknown): string {
  if (error instanceof ApiHttpError) {
    return error.message || `请求失败（HTTP ${error.status}）`
  }
  if (error instanceof Error) {
    return error.message
  }
  return '加载失败，请重试'
}

interface QueryErrorPanelProps {
  error: unknown
  onRetry: () => void
  className?: string
}

export function QueryErrorPanel({ error, onRetry, className }: QueryErrorPanelProps) {
  const message = messageFromUnknown(error)

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        className,
      )}
    >
      <p className="max-w-sm text-sm text-destructive">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        重试
      </Button>
    </div>
  )
}
