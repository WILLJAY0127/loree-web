import axios from 'axios'
import { useRoleStore } from '@/shared/store/role-store'

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || ''

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
})

apiClient.interceptors.request.use((config) => {
  const role = useRoleStore.getState().currentRole
  config.headers.set('X-Current-Role', role)
  return config
})
