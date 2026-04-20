import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { TaskDetail } from '@/features/task/api/types'
import type { TaskCommandOp } from '@/features/task/api/task-api'
import type { AppRole } from '@/shared/store/role-store'

interface TaskDetailActionsProps {
  task: TaskDetail
  role: AppRole
  busy: boolean
  onCommand: (cmd: TaskCommandOp) => void
}

export function TaskDetailActions({ task, role, busy, onCommand }: TaskDetailActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const showStart = task.status === 'TODO' && role === 'BODY'
  const showSubmit = task.status === 'IN_PROGRESS' && role === 'BODY'
  const showApproveReject = task.status === 'PENDING_REVIEW' && role === 'MIND'
  const showRestart = task.status === 'REJECTED' && role === 'BODY'

  const hasActions = showStart || showSubmit || showApproveReject || showRestart

  const submitReject = () => {
    const r = reason.trim()
    if (!r) return
    onCommand({ op: 'reject', reason: r })
    setRejectOpen(false)
    setReason('')
  }

  const cancelReject = () => {
    setRejectOpen(false)
    setReason('')
  }

  if (!hasActions && !rejectOpen) {
    return (
      <p className="text-xs text-muted-foreground">
        当前状态无可用操作，或当前角色无权操作（请用顶栏切换角色）。
      </p>
    )
  }

  return (
    <section className="space-y-3 rounded-lg border border-dashed bg-muted/20 p-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">操作</h3>
      <div className="flex flex-wrap gap-2">
        {showStart ? (
          <Button type="button" size="sm" disabled={busy} onClick={() => onCommand({ op: 'start' })}>
            开始执行
          </Button>
        ) : null}
        {showSubmit ? (
          <Button type="button" size="sm" disabled={busy} onClick={() => onCommand({ op: 'submit' })}>
            提交验收
          </Button>
        ) : null}
        {showApproveReject ? (
          <>
            <Button type="button" size="sm" disabled={busy} onClick={() => onCommand({ op: 'approve' })}>
              验收通过
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={() => setRejectOpen((v) => !v)}
            >
              驳回
            </Button>
          </>
        ) : null}
        {showRestart ? (
          <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => onCommand({ op: 'restart' })}>
            重新执行
          </Button>
        ) : null}
      </div>

      {showApproveReject && rejectOpen ? (
        <div className="space-y-2 rounded-md border bg-background p-3">
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">驳回原因（必填，≤500 字）</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              rows={3}
              className="resize-y rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px]"
              placeholder="请说明驳回原因…"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="destructive" disabled={busy || !reason.trim()} onClick={submitReject}>
              确认驳回
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={cancelReject}>
              取消
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
