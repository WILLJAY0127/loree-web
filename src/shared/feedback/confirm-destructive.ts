/** 不可逆操作前的确认；后续可替换为 Dialog（阶段 0 第二步）。 */
export function confirmDestructive(message: string): boolean {
  return window.confirm(message)
}
