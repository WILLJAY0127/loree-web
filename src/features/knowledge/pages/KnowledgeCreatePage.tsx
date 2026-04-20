import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StubPage } from '@/features/shell/stub-page'

export default function KnowledgeCreatePage() {
  return (
    <StubPage title="新建知识点" description="独立创建入口（精神）；后续接 Command 表单。">
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/knowledge">返回知识点</Link>
      </Button>
    </StubPage>
  )
}
