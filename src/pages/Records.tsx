import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRecords, deleteRecord } from '../services/recordService'
import { listCategories } from '../services/categoryService'
import { listAccounts } from '../services/accountService'
import type { Record, RecordFilter, Category, Account } from '../types'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/common/PageHeader'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'

export default function Records() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [records, setRecords] = useState<Record[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [filter, setFilter] = useState<RecordFilter>({})
  const [loading, setLoading] = useState(true)

  const load = async (f: RecordFilter = filter) => {
    setLoading(true)
    try {
      setRecords(await listRecords(f))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([load(), listCategories().then(setCategories), listAccounts().then(setAccounts)])
  }, [])

  const apply = async () => load(filter)

  const handleDelete = async (id: number) => {
    if (!confirm(t('deleteRecordConfirm'))) return
    await deleteRecord(id)
    load()
  }

  const typeLabel = (type: string) =>
    type === 'income' ? t('incomeLabel') : type === 'expense' ? t('expenseLabel') : t('transferLabel')

  return (
    <div className="p-6">
      <PageHeader title={t('recordsTitle')} actions={<Link to="/records/new" className="btn-primary">{t('addOne')}</Link>} />

      <div className="card mb-4 grid grid-cols-6 gap-3 items-end">
        <div>
          <label className="label">{t('startDate')}</label>
          <input
            type="date"
            className="input"
            value={filter.startDate || ''}
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="label">{t('endDate')}</label>
          <input
            type="date"
            className="input"
            value={filter.endDate || ''}
            onChange={(e) => setFilter({ ...filter, endDate: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="label">{t('type')}</label>
          <select
            className="input"
            value={filter.type || ''}
            onChange={(e) => setFilter({ ...filter, type: (e.target.value || undefined) as RecordFilter['type'] })}
          >
            <option value="">{t('all')}</option>
            <option value="income">{t('incomeLabel')}</option>
            <option value="expense">{t('expenseLabel')}</option>
            <option value="transfer">{t('transferLabel')}</option>
          </select>
        </div>
        <div>
          <label className="label">{t('category')}</label>
          <select
            className="input"
            value={filter.categoryId || ''}
            onChange={(e) => setFilter({ ...filter, categoryId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">{t('all')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {displayName(c.name, locale)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t('account')}</label>
          <select
            className="input"
            value={filter.accountId || ''}
            onChange={(e) => setFilter({ ...filter, accountId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">{t('all')}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {displayName(a.name, locale)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={apply}>
            {t('filter')}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setFilter({})
              load({})
            }}
          >
            {t('reset')}
          </button>
        </div>
        <div className="col-span-2">
          <label className="label">{t('keyword')}</label>
          <input
            className="input"
            placeholder={t('keywordPlaceholder')}
            value={filter.keyword || ''}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value || undefined })}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
          />
        </div>
        <div>
          <label className="label">{t('minAmount')}</label>
          <input
            type="number"
            className="input"
            value={filter.minAmount ?? ''}
            onChange={(e) => setFilter({ ...filter, minAmount: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div>
          <label className="label">{t('maxAmount')}</label>
          <input
            type="number"
            className="input"
            value={filter.maxAmount ?? ''}
            onChange={(e) => setFilter({ ...filter, maxAmount: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t('dateCol')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('type')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('category')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('account')}</th>
              <th className="text-left px-4 py-3 font-medium">{t('noteCol')}</th>
              <th className="text-right px-4 py-3 font-medium">{t('amountCol')}</th>
              <th className="text-right px-4 py-3 font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  {t('loading')}
                </td>
              </tr>
            )}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  {t('noFilteredRecords')}
                </td>
              </tr>
            )}
            {!loading &&
              records.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-600">{r.record_date}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        r.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.type === 'expense'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {typeLabel(r.type)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {r.category_icon} {displayName(r.category_name, locale) || t('none')}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.account_icon} {displayName(r.account_name, locale) || t('none')}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 max-w-[160px] truncate">{r.note || t('none')}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold ${
                      r.type === 'income' ? 'text-emerald-600' : r.type === 'expense' ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    {r.type === 'income' ? '+' : r.type === 'expense' ? '-' : ''}¥{formatMoney(r.amount, locale)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to={`/records/${r.id}`} className="text-emerald-600 hover:underline mr-3">
                      {t('edit')}
                    </Link>
                    <button className="text-rose-500 hover:underline" onClick={() => handleDelete(r.id)}>
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-slate-400 mt-2">{t('recordCount', { n: records.length })}</div>
    </div>
  )
}
