import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  executeTaskCommand,
  fetchTaskDetail,
  type TaskCommandOp,
} from '@/features/task/api/task-api'
import { taskKeys } from '@/shared/query/query-keys'
import { invalidateAfterCommand } from '@/shared/query/invalidate-after-command'
import { ApiHttpError } from '@/shared/api/http'
import { toast } from '@/shared/feedback/toast-store'

/**
 * 任务详情读模型 + 状态机 Command 写模型（与架构文档 M1 操作区一致）。
 */
export function useTaskDetail(rawTaskId: string | undefined) {
  const id = rawTaskId?.trim() ?? ''
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTaskDetail(id),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: (cmd: TaskCommandOp) => executeTaskCommand(id, cmd),
    onSuccess: async (_, cmd) => {
      if (cmd.op === 'approve') {
        await invalidateAfterCommand(qc, 'taskApprove')
      } else if (cmd.op === 'reject') {
        await invalidateAfterCommand(qc, 'taskReject')
      } else {
        await invalidateAfterCommand(qc, 'taskFlowMutation')
      }
      await qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
      toast('操作成功')
    },
    onError: (e) => {
      const msg = e instanceof ApiHttpError ? e.message : e instanceof Error ? e.message : '操作失败'
      toast(msg, { variant: 'destructive' })
    },
  })

  return { taskId: id, query, mutation }
}
