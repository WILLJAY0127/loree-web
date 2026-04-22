/**
 * 主壳路由元信息：顶栏标题、返回目标、底栏显隐。
 * 与《UI 交互设计文档》S1.2 / S1.3 及《前端技术架构》S5 对齐；后续可迁到 `route.handle`。
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function routeTitle(pathname: string): string {
  if (pathname === '/tasks') return '任务列表'
  if (pathname === '/tasks/new') return '新建任务'
  if (/^\/tasks\/[^/]+\/edit$/.test(pathname)) return '编辑任务'
  if (/^\/tasks\/[^/]+$/.test(pathname)) return '任务详情'

  if (pathname === '/projects') return '项目管理'

  if (pathname === '/knowledge') return '知识点'
  if (pathname === '/knowledge/create') return '新建知识点'
  if (pathname === '/knowledge/inspection') return '知识巡检'
  if (pathname.startsWith('/knowledge/deposit/')) return '知识沉淀'
  if (pathname.startsWith('/knowledge/')) return '知识点详情'

  if (pathname === '/review') return '今日复习'
  if (pathname.startsWith('/review/')) return '复习作答'

  if (pathname === '/retro') return '复盘'
  if (pathname === '/stats') return '统计'
  if (pathname === '/settings') return '我的'

  return '知鹿'
}

/** 顶栏「返回」目标；`null` 表示根级 Tab 页不展示返回。 */
export function routeBackTarget(pathname: string): string | null {
  if (pathname === '/tasks/new') return '/tasks'
  const edit = pathname.match(/^\/tasks\/([^/]+)\/edit$/)
  if (edit) return `/tasks/${edit[1]}`
  const taskDetail = pathname.match(/^\/tasks\/([^/]+)$/)
  if (taskDetail && taskDetail[1] !== 'new') return '/tasks'

  if (pathname === '/projects') return '/tasks'

  if (pathname === '/knowledge/create') return '/knowledge'
  if (pathname.startsWith('/knowledge/deposit/')) {
    const taskId = pathname.split('/')[3]
    return taskId ? `/tasks/${taskId}` : '/knowledge'
  }
  const km = pathname.match(/^\/knowledge\/([^/]+)$/)
  if (km && km[1] !== 'create' && km[1] !== 'inspection' && UUID_RE.test(km[1])) {
    return '/knowledge'
  }

  if (pathname.startsWith('/review/') && pathname !== '/review') return '/review'

  if (pathname === '/retro' || pathname === '/stats') return '/settings'

  return null
}

/**
 * 沉浸子流程隐藏底栏（创建 / 编辑 / 沉淀 / 复习作答），避免与主 Tab 抢焦点。
 */
export function shouldHideBottomNav(pathname: string): boolean {
  if (pathname === '/tasks/new') return true
  if (/^\/tasks\/[^/]+\/edit$/.test(pathname)) return true
  if (pathname === '/knowledge/create') return true
  if (pathname.startsWith('/knowledge/deposit/')) return true
  if (pathname.startsWith('/review/') && pathname !== '/review') return true
  return false
}
