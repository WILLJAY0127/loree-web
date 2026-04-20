import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function ReviewListPage() {
  return (
    <StubPage title="今日复习" description="≤10 条列表占位；后续接复习读模型。">
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/review/sample-schedule-id">示例复习作答</Link>
      </Button>
    </StubPage>
  )
}
