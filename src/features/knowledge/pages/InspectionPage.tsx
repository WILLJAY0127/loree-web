import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function InspectionPage() {
  return (
    <StubPage title="知识巡检" description="四步向导占位；后续接巡检 Query / Command。">
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/knowledge">返回知识点</Link>
      </Button>
    </StubPage>
  )
}
