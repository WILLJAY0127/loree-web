import { create } from 'zustand'

type ToastVariant = 'default' | 'destructive'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  items: ToastItem[]
  show: (message: string, opts?: { variant?: ToastVariant }) => void
  dismiss: (id: string) => void
}

let idSeq = 0
const DEFAULT_DURATION_MS = 2500

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  show(message, opts) {
    const id = `${Date.now()}-${idSeq++}`
    const variant = opts?.variant ?? 'default'
    set((s) => ({ items: [...s.items, { id, message, variant }] }))
    window.setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }))
    }, DEFAULT_DURATION_MS)
  },
  dismiss(id) {
    set((s) => ({ items: s.items.filter((t) => t.id !== id) }))
  },
}))

/** 在非组件代码（如 mutation 回调）中调用 */
export function toast(message: string, opts?: { variant?: ToastVariant }) {
  useToastStore.getState().show(message, opts)
}
