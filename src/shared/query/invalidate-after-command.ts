import type { QueryClient } from '@tanstack/react-query'
import {
  depositSessionKeys,
  knowledgeKeys,
  projectKeys,
  reviewKeys,
  tagKeys,
  taskKeys,
} from '@/shared/query/query-keys'

/**
 * Command 成功后应失效的 Query — 与《前端技术架构设计文档》S6.4 缓存失效矩阵一致。
 * 在 mutation `onSuccess` 里传入 `queryClient` 与本枚举即可。
 */
export type LoreeInvalidationCommand =
  | 'taskCreateOrUpdate'
  | 'taskApprove'
  | 'taskReject'
  | 'depositSubmit'
  | 'knowledgeEdit'
  | 'knowledgeLinkChange'
  | 'knowledgeArchiveOrRestore'
  | 'reviewComplete'

export async function invalidateAfterCommand(
  client: QueryClient,
  command: LoreeInvalidationCommand,
): Promise<void> {
  switch (command) {
    case 'taskCreateOrUpdate':
      await Promise.all([
        client.invalidateQueries({ queryKey: taskKeys.all }),
        client.invalidateQueries({ queryKey: projectKeys.all }),
      ])
      return
    case 'taskApprove':
      await Promise.all([
        client.invalidateQueries({ queryKey: taskKeys.all }),
        client.invalidateQueries({ queryKey: depositSessionKeys.all }),
      ])
      return
    case 'taskReject':
      await client.invalidateQueries({ queryKey: taskKeys.all })
      return
    case 'depositSubmit':
      await Promise.all([
        client.invalidateQueries({ queryKey: taskKeys.all }),
        client.invalidateQueries({ queryKey: knowledgeKeys.all }),
        client.invalidateQueries({ queryKey: tagKeys.all }),
        client.invalidateQueries({ queryKey: reviewKeys.all }),
      ])
      return
    case 'knowledgeEdit':
    case 'knowledgeLinkChange':
      await client.invalidateQueries({ queryKey: knowledgeKeys.all })
      return
    case 'knowledgeArchiveOrRestore':
      await Promise.all([
        client.invalidateQueries({ queryKey: knowledgeKeys.all }),
        client.invalidateQueries({ queryKey: reviewKeys.all }),
      ])
      return
    case 'reviewComplete':
      await Promise.all([
        client.invalidateQueries({ queryKey: reviewKeys.all }),
        client.invalidateQueries({ queryKey: knowledgeKeys.all }),
      ])
      return
    default: {
      const _exhaustive: never = command
      return _exhaustive
    }
  }
}
