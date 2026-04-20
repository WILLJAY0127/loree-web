import { useToastStore } from '@/shared/feedback/toast-store'
import { cn } from '@/lib/utils'

export function ToastHost() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8 sm:items-end"
      aria-live="polite"
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto max-w-md rounded-md border px-4 py-2 text-left text-sm shadow-md transition-opacity hover:opacity-90',
            t.variant === 'destructive'
              ? 'border-destructive/30 bg-destructive text-destructive-foreground'
              : 'border-border bg-card text-card-foreground',
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
