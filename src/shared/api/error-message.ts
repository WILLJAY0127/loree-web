/**
 * 将后端 `code` / HTTP 状态与 `message` 拼成对用户可读的一句话（40301/40302 等）。
 * 由 `http.ts` 在抛出 `ApiHttpError` 前调用。
 */
export function enrichApiFailureMessage(message: string, httpStatus: number, apiCode?: number): string {
  const base =
    message?.trim() || (httpStatus ? `请求失败（HTTP ${httpStatus}）` : '请求失败')
  if (apiCode === 40301) {
    return `${base} 请使用顶栏「切换角色」切换到正确模式后重试。`
  }
  if (apiCode === 40302) {
    return `${base} 请先在欢迎屏或顶栏选择「精神 / 身体」模式。`
  }
  if (httpStatus === 403 && apiCode === undefined && /无权|403/i.test(base)) {
    return `${base} 若应使用另一身份，可用顶栏「切换角色」。`
  }
  return base
}
