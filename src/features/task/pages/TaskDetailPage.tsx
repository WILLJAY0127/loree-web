import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function TaskDetailPage() {
  const { taskId } = useParams()

  return (
    <StubPage
      title="任务详情"
      description={`taskId: ${taskId ?? '（缺失）'} — 后续接入任务详情 Query。`}
    >
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/tasks">返回任务列表</Link>
      </Button>
    </StubPage>
  )
}
