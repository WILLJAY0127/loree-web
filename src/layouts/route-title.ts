/** 顶栏标题：按路径粗匹配，后续可改为路由 handle.meta。 */
export function routeTitle(pathname: string): string {
  if (pathname === '/tasks') return '任务列表'
  if (pathname.startsWith('/tasks/')) return '任务详情'
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
