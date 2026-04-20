import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function DepositPage() {
  const { taskId } = useParams()

  return (
    <StubPage title="知识沉淀" description={`关联任务 taskId: ${taskId ?? '—'}`}>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/tasks">返回任务</Link>
      </Button>
    </StubPage>
  )
}
