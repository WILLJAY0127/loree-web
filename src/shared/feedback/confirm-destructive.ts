import { openConfirm } from '@/shared/feedback/confirm-store'

/** 不可逆或敏感操作前确认（AlertDialog，替代 `window.confirm`）。 */
export function confirmDestructive(message: string): Promise<boolean> {
  return openConfirm({
    title: '确认操作',
    description: message,
    variant: 'destructive',
    confirmText: '确认',
    cancelText: '取消',
  })
}
