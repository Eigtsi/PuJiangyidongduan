export function formatNumber(value) {
  return String(Number(value))
}

// 金额（元）→ 万元展示，保留 1 位小数；不足 1 万时按元显示
export function formatWan(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1)
  return n.toFixed(0)
}
