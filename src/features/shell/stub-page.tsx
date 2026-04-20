import type { ReactNode } from 'react'

interface StubPageProps {
  title: string
  description?: string
  children?: ReactNode
}

export function StubPage({ title, description, children }: StubPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground">占位页面</p>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}
