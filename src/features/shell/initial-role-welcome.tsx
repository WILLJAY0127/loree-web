import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AppRole } from '@/shared/store/role-store'
import { useRoleStore } from '@/shared/store/role-store'
import { useBootStore } from '@/shared/store/boot-store'

function RoleCard({
  label,
  emoji,
  description,
  selected,
  onSelect,
}: {
  label: string
  emoji: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
          : 'border-border bg-card hover:bg-muted/40',
      )}
    >
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <span className="font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

/**
 * 首次进入简化版：全屏选择主导模式（精神 / 身体），之后写入 `loree-boot` 不再展示。
 * 与 PRD/UI 全屏 ActionSheet 相比：无动画、无二次确认；顶栏仍可后续切换角色。
 */
export function InitialRoleWelcome() {
  const currentRole = useRoleStore((s) => s.currentRole)
  const setRole = useRoleStore((s) => s.setRole)
  const dismiss = useBootStore((s) => s.dismissInitialWelcome)

  const [draft, setDraft] = useState<AppRole>(currentRole)

  const enter = () => {
    setRole(draft)
    dismiss()
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col justify-center gap-8 px-6 py-10">
        <header className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">欢迎使用</p>
          <h1 className="text-2xl font-semibold tracking-tight">知鹿 Loree</h1>
          <p className="text-sm text-muted-foreground">
            请选择本次使用的主导模式。之后可在顶栏随时切换；精神侧偏规划与沉淀，身体侧偏执行与复习。
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <RoleCard
            label="精神模式"
            emoji="🧠"
            description="任务验收、知识沉淀、巡检等"
            selected={draft === 'MIND'}
            onSelect={() => setDraft('MIND')}
          />
          <RoleCard
            label="身体模式"
            emoji="💪"
            description="任务执行、今日复习等"
            selected={draft === 'BODY'}
            onSelect={() => setDraft('BODY')}
          />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
          <Button type="button" size="lg" className="w-full" onClick={enter}>
            进入应用
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            进入后将记住你的选择；清除站点数据可再次看到本页。
          </p>
        </div>
      </div>
    </div>
  )
}
