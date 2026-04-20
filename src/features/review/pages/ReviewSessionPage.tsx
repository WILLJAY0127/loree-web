import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function ReviewSessionPage() {
  const { scheduleId } = useParams()

  return (
    <StubPage title="复习作答" description={`scheduleId: ${scheduleId ?? '—'}`}>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/review">返回今日复习</Link>
      </Button>
    </StubPage>
  )
}
