import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function KnowledgeListPage() {
  return (
    <StubPage title="知识点" description="列表与筛选；后续接入 knowledge Query。">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/knowledge/00000000-0000-0000-0000-000000000002">示例详情</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/knowledge/create">新建（精神）</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/knowledge/deposit/00000000-0000-0000-0000-000000000001">沉淀（精神）</Link>
        </Button>
      </div>
    </StubPage>
  )
}
