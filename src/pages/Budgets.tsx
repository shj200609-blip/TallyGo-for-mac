import { useEffect, useState } from 'react'
import { listBudgets, saveBudget, deleteBudget } from '../services/budgetService'
import { listCategories } from '../services/categoryService'
import type { Budget, Category } from '../types'
import { formatMoney, currentMonth, monthLabel } from '../utils/format'
import PageHeader from '../components/common/PageHeader'
import MonthPicker from '../components/common/MonthPicker'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'

export default function Budgets() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [month, setMonth] = useState(currentMonth())
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [categoryId, setCategoryId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [b, c] = await Promise.all([listBudgets(month), listCategories()])
      setBudgets(b)
      setCategories(c)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [month])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setError(t('enterValidBudget'))
      return
    }
    await saveBudget({
      month,
      category_id: categoryId ? Number(categoryId) : null,
      amount: amt,
    })
    setShowForm(false)
    setAmount('')
    setCategoryId('')
    setError('')
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('deleteBudgetConfirm'))) return
    await deleteBudget(id)
    load()
  }

  const totalBudget = budgets.find((b) => b.category_id === null)
  const catBudgets = budgets.filter((b) => b.category_id !== null)

  return (
    <div className="p-6">
      <PageHeader
        title={t('budgetsTitle')}
        actions={
          <>
            <div className="mr-2">
              <MonthPicker value={month} onChange={setMonth} />
            </div>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              {t('setBudget')}
            </button>
          </>
        }
      />

      {loading ? (
        <div className="text-slate-500">{t('loading')}</div>
      ) : (
        <div className="space-y-4">
          {totalBudget && (
            <div className="card">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{t('monthlyBudget')}</div>
                <button className="text-xs text-slate-400 hover:text-rose-600" onClick={() => handleDelete(totalBudget.id)}>
                  {t('delete')}
                </button>
              </div>
              <BudgetBar spent={totalBudget.spent} amount={totalBudget.amount} t={t} locale={locale} />
            </div>
          )}

          {catBudgets.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {catBudgets.map((b) => (
                <div key={b.id} className="card">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">
                      {b.category_icon} {displayName(b.category_name, locale)}
                    </div>
                    <button className="text-xs text-slate-400 hover:text-rose-600" onClick={() => handleDelete(b.id)}>
                      {t('delete')}
                    </button>
                  </div>
                  <BudgetBar
                    spent={b.spent}
                    amount={b.amount}
                    color={b.category_color || '#10b981'}
                    t={t}
                    locale={locale}
                  />
                </div>
              ))}
            </div>
          )}

          {!budgets.length && (
            <div className="card text-center py-12 text-slate-400">
              {t('noBudgetThisMonth')}
              <div className="mt-3">
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  {t('setFirstBudget')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={submit}
            className="bg-white rounded-xl p-6 w-96 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold">
              {t('setBudgetTitle')} · {monthLabel(month, locale)}
            </h2>
            <div>
              <label className="label">{t('budgetType')}</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">{t('totalBudgetOption')}</option>
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {displayName(c.name, locale)}
                      {t('categoryBudgetSuffix')}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label">{t('budgetAmount')}</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="text-xs text-slate-400">{t('budgetOverwriteHint')}</div>
            {error && <div className="text-sm text-rose-600">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </button>
              <button type="submit" className="btn-primary">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function BudgetBar({
  spent,
  amount,
  color = '#10b981',
  t,
  locale,
}: {
  spent: number
  amount: number
  color?: string
  t: (key: any, vars?: Record<string, string | number>) => string
  locale: string
}) {
  const pct = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0
  const over = spent > amount
  const near = !over && pct >= 80
  const barColor = over ? '#f43f5e' : near ? '#f59e0b' : color
  const money = (n: number) => `¥${formatMoney(n, locale)}`
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span>
          {t('spent')} {money(spent)}
        </span>
        <span className="text-slate-500">
          {t('budget')} {money(amount)} · {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      {over && (
        <div className="text-xs text-rose-600 mt-1">
          {t('overBudget')} {money(spent - amount)}
        </div>
      )}
      {near && !over && <div className="text-xs text-amber-600 mt-1">{t('nearBudget')}</div>}
    </div>
  )
}
