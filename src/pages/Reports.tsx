import { useEffect, useState } from 'react'
import { getMonthlyReport, getTrend } from '../services/reportService'
import type { MonthlyReport, TrendPoint } from '../types'
import { formatMoney, currentMonth, monthLabel } from '../utils/format'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart'
import PageHeader from '../components/common/PageHeader'
import MonthPicker from '../components/common/MonthPicker'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'

export default function Reports() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [month, setMonth] = useState(currentMonth())
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([getMonthlyReport(month), getTrend(12)])
      .then(([r, t2]) => {
        setReport(r)
        setTrend(t2)
      })
      .finally(() => setLoading(false))
  }, [month])

  if (loading) return <div className="p-8 text-slate-500">{t('loading')}</div>

  const money = (n: number) => `¥${formatMoney(n, locale)}`

  return (
    <div className="p-6 space-y-5">
      <PageHeader title={t('reportsTitle')} actions={<MonthPicker value={month} onChange={setMonth} />} />

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-slate-500">{t('totalIncome')}</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{money(report?.income ?? 0)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">{t('totalExpense')}</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{money(report?.expense ?? 0)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">{t('netBalance')}</div>
          <div className={`text-2xl font-bold mt-1 ${(report?.net ?? 0) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {money(report?.net ?? 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="font-medium mb-2">{t('expensePieTitle')}</div>
          <CategoryPieChart data={report?.byCategory ?? []} emptyText={t('noExpenseThisMonth')} />
        </div>
        <div className="card">
          <div className="font-medium mb-2">{t('expenseRanking')}</div>
          <div className="space-y-2">
            {(report?.byCategory ?? []).length === 0 && (
              <div className="text-sm text-slate-400 py-8 text-center">{t('noExpenseThisMonth')}</div>
            )}
            {(report?.byCategory ?? []).map((c) => {
              const pct = report && report.expense > 0 ? (c.total / report.expense) * 100 : 0
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      {c.icon} {displayName(c.name, locale)}{' '}
                      <span className="text-slate-400">（{t('times', { n: c.count })}）</span>
                    </span>
                    <span className="font-medium">
                      {money(c.total)} · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: c.color || '#10b981' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="font-medium mb-2">{t('trend12')}</div>
        <MonthlyTrendChart data={trend} locale={locale} />
      </div>

      <div className="card">
        <div className="font-medium mb-3">{t('accountMonthlyStats')}</div>
        <table className="w-full text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="text-left py-2">{t('account')}</th>
              <th className="text-right py-2">{t('income')}</th>
              <th className="text-right py-2">{t('expense')}</th>
            </tr>
          </thead>
          <tbody>
            {(report?.byAccount ?? []).map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="py-2">
                  {a.icon} {displayName(a.name, locale)}
                </td>
                <td className="py-2 text-right text-emerald-600">{money(a.income)}</td>
                <td className="py-2 text-right text-rose-600">{money(a.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-slate-400">{monthLabel(month, locale)}</div>
    </div>
  )
}
