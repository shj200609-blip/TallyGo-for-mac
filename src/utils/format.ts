export function formatMoney(n: number, locale: string = 'zh-CN'): string {
  return n.toLocaleString(locale === 'zh' || locale.startsWith('zh') ? 'zh-CN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function currentDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthLabel(month: string, lang: 'zh' | 'en' = 'zh'): string {
  const [y, m] = month.split('-').map(Number)
  if (lang === 'zh') return `${y}年${m}月`
  const name = new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' })
  return `${name} ${y}`
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
