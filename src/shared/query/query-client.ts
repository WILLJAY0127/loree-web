import { QueryClient } from '@tanstack/react-query'

/** 全局单例：供 `invalidateAfterCommand` 与非组件代码使用；`AppProviders` 引用同一实例。 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})
