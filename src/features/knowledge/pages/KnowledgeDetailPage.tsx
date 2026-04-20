import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function KnowledgeDetailPage() {
  const { id } = useParams()

  return (
    <StubPage title="知识点详情" description={`id: ${id ?? '—'}`}>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/knowledge">返回列表</Link>
      </Button>
    </StubPage>
  )
}
