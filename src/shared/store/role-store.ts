import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppRole = 'MIND' | 'BODY'

interface RoleState {
  currentRole: AppRole
  setRole: (role: AppRole) => void
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      currentRole: 'MIND',
      setRole: (role) => set({ currentRole: role }),
    }),
    { name: 'loree-role' },
  ),
)
