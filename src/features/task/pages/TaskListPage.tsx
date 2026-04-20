import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function TaskListPage() {
  return (
    <StubPage
      title="任务列表"
      description="后续接入任务看板 Query；此处仅验证路由与布局。"
    >
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/tasks/00000000-0000-0000-0000-000000000001">打开示例任务详情</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/projects">项目管理</Link>
        </Button>
      </div>
    </StubPage>
  )
}
