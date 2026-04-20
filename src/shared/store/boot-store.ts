import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 与「角色」无关的一次性引导状态（持久化在本机）。
 * `initialWelcomeDismissed`：是否已完成首次「主导模式」欢迎屏（对齐 UI 文档首次进入，先做简化版）。
 */
interface BootState {
  initialWelcomeDismissed: boolean
  dismissInitialWelcome: () => void
}

export const useBootStore = create<BootState>()(
  persist(
    (set) => ({
      initialWelcomeDismissed: false,
      dismissInitialWelcome: () => set({ initialWelcomeDismissed: true }),
    }),
    { name: 'loree-boot' },
  ),
)
