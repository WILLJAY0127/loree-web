import { create } from 'zustand'

export type ConfirmVariant = 'default' | 'destructive'

export interface OpenConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

const defaults = { confirmText: '确认', cancelText: '取消' } as const

interface ConfirmState {
  open: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  variant: ConfirmVariant
  resolver: ((value: boolean) => void) | null
  request: (opts: OpenConfirmOptions) => Promise<boolean>
  complete: (value: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  title: '',
  description: '',
  confirmText: defaults.confirmText,
  cancelText: defaults.cancelText,
  variant: 'default',
  resolver: null,

  request: (opts) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title: opts.title,
        description: opts.description,
        confirmText: opts.confirmText ?? defaults.confirmText,
        cancelText: opts.cancelText ?? defaults.cancelText,
        variant: opts.variant ?? 'default',
        resolver: resolve,
      })
    }),

  complete: (value) => {
    const { resolver } = get()
    if (!resolver) return
    set({
      open: false,
      title: '',
      description: '',
      confirmText: defaults.confirmText,
      cancelText: defaults.cancelText,
      variant: 'default',
      resolver: null,
    })
    resolver(value)
  },
}))

/** 任意处 `await openConfirm({ ... })` */
export function openConfirm(opts: OpenConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().request(opts)
}
