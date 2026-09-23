import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMonthlyReport } from '../services/reportService'
import { listRecords, deleteRecord } from '../services/recordService'
import type { MonthlyReport, Record } from '../types'
import { formatMoney, currentMonth, monthLabel } from '../utils/format'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'

export default function Dashboard() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [recent, setRecent] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const month = currentMonth()

  const load = async () => {
    setLoading(true)
    try {
      const [r, recs] = await Promise.all([getMonthlyReport(month), listRecords()])
      setReport(r)
      setRecent(recs.slice(0, 8))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm(t('deleteRecordConfirm'))) return
    await deleteRecord(id)
    load()
  }

  if (loading) return <div className="p-8 text-slate-500">{t('loading')}</div>

  const money = (n: number) => `¥${formatMoney(n, locale)}`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {t('monthlyOverview')} · {monthLabel(month, locale)}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('welcomeBack')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/records/new?type=income" className="btn-primary">
            {t('addIncome')}
          </Link>
          <Link to="/records/new?type=expense" className="btn bg-slate-900 text-white hover:bg-slate-800">
            {t('addExpense')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-slate-500">{t('income')}</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{money(report?.income ?? 0)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">{t('expense')}</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{money(report?.expense ?? 0)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500">{t('net')}</div>
          <div
            className={`text-2xl font-bold mt-1 ${(report?.net ?? 0) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}
          >
            {money(report?.net ?? 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="font-medium mb-3">{t('expensePie')}</div>
          <CategoryPieChart data={report?.byCategory ?? []} emptyText={t('noExpenseThisMonth')} />
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">{t('recentRecords')}</div>
            <Link to="/records" className="text-sm text-emerald-600 hover:underline">
              {t('viewAll')}
            </Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && (
              <div className="text-sm text-slate-400 py-8 text-center">{t('noRecords')}</div>
            )}
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">
                    {r.category_icon || (r.type === 'income' ? '💰' : '💸')}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {r.type === 'transfer'
                        ? t('transfer')
                        : displayName(r.category_name, locale) || t('unclassified')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {r.record_date} {r.note || ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      r.type === 'income'
                        ? 'text-emerald-600'
                        : r.type === 'expense'
                          ? 'text-rose-600'
                          : 'text-slate-600'
                    }`}
                  >
                    {r.type === 'income' ? '+' : r.type === 'expense' ? '-' : '⇄ '}
                    {money(r.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="text-xs text-slate-400 hover:text-emerald-600"
                      onClick={() => navigate(`/records/${r.id}`)}
                    >
                      {t('edit')}
                    </button>
                    <button
                      className="text-xs text-slate-400 hover:text-rose-600"
                      onClick={() => handleDelete(r.id)}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
