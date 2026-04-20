import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { useConfirmStore } from '@/shared/feedback/confirm-store'
import { cn } from '@/lib/utils'

export function ConfirmHost() {
  const skipDismissRef = useRef(false)

  const open = useConfirmStore((s) => s.open)
  const title = useConfirmStore((s) => s.title)
  const description = useConfirmStore((s) => s.description)
  const confirmText = useConfirmStore((s) => s.confirmText)
  const cancelText = useConfirmStore((s) => s.cancelText)
  const variant = useConfirmStore((s) => s.variant)
  const complete = useConfirmStore((s) => s.complete)

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (skipDismissRef.current) {
            skipDismissRef.current = false
            return
          }
          complete(false)
        }
      }}
    >
      <AlertDialogContent
        onEscapeKeyDown={() => {
          complete(false)
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className={cn(variant === 'destructive' && buttonVariants({ variant: 'destructive' }))}
            onClick={() => {
              skipDismissRef.current = true
              complete(true)
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
