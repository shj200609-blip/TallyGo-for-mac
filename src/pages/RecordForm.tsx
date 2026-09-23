import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { listCategories } from '../services/categoryService'
import { listAccounts } from '../services/accountService'
import { createRecord, updateRecord } from '../services/recordService'
import type { Category, Account, Record, RecordType } from '../types'
import { currentDate, formatMoney } from '../utils/format'
import { select } from '../services/db'
import PageHeader from '../components/common/PageHeader'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'

export default function RecordForm() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const { id } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [type, setType] = useState<RecordType>((search.get('type') as RecordType) || 'expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [transferTo, setTransferTo] = useState<number | ''>('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(currentDate())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listCategories().then(setCategories), listAccounts().then(setAccounts)])
  }, [])

  useEffect(() => {
    if (!id) return
    select<Record>('SELECT * FROM records WHERE id = ?', [Number(id)]).then((rows) => {
      const r = rows[0]
      if (!r) return
      setType(r.type)
      setAmount(String(r.amount))
      setCategoryId(r.category_id ?? '')
      setAccountId(r.account_id ?? '')
      setTransferTo(r.transfer_to ?? '')
      setNote(r.note ?? '')
      setDate(r.record_date)
    })
  }, [id])

  const filteredCategories = categories.filter((c) => (type === 'transfer' ? false : c.type === type))

  useEffect(() => {
    if (type === 'transfer' || !categoryId) return
    const cat = categories.find((c) => c.id === categoryId)
    if (cat && cat.type !== type) setCategoryId('')
  }, [type, categories])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setError(t('enterValidAmount'))
      return
    }
    if (type !== 'transfer' && !categoryId) {
      setError(t('selectCategoryError'))
      return
    }
    if (!accountId) {
      setError(t('selectAccountError'))
      return
    }
    if (type === 'transfer' && !transferTo) {
      setError(t('selectTransferIn'))
      return
    }
    if (type === 'transfer' && accountId === transferTo) {
      setError(t('accountsDiffer'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        type,
        amount: amt,
        category_id: type === 'transfer' ? null : Number(categoryId),
        account_id: Number(accountId),
        transfer_to: type === 'transfer' ? Number(transferTo) : null,
        note,
        record_date: date,
      }
      if (id) {
        await updateRecord(Number(id), payload)
      } else {
        await createRecord(payload)
      }
      navigate('/records')
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const typeButtons: Array<{ value: RecordType; label: string }> = [
    { value: 'expense', label: t('expenseBtn') },
    { value: 'income', label: t('incomeBtn') },
    { value: 'transfer', label: t('transferBtn') },
  ]

  return (
    <div className="p-6 max-w-xl">
      <PageHeader title={id ? t('editRecord') : t('newRecord')} />

      <form onSubmit={submit} className="card space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {typeButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setType(btn.value)}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                type === btn.value
                  ? btn.value === 'expense'
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : btn.value === 'income'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-slate-500 bg-slate-100 text-slate-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div>
          <label className="label">{t('amount')}</label>
          <input
            className="input text-2xl font-bold h-12"
            type="number"
            step="0.01"
            min="0.01"
            placeholder={t('amountPlaceholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
        </div>

        {type !== 'transfer' && (
          <div>
            <label className="label">{t('category')}</label>
            <div className="grid grid-cols-5 gap-2">
              {filteredCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`flex flex-col items-center py-2 rounded-lg border text-xs transition-colors ${
                    categoryId === c.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="mt-0.5 truncate w-full text-center">{displayName(c.name, locale)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{type === 'transfer' ? t('transferOut') : t('account')}</label>
            <select
              className="input"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">{t('pleaseSelect')}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {displayName(a.name, locale)}（{t('balance')} ¥{formatMoney(a.balance, locale)}）
                </option>
              ))}
            </select>
          </div>
          {type === 'transfer' && (
            <div>
              <label className="label">{t('transferIn')}</label>
              <select
                className="input"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">{t('pleaseSelect')}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {displayName(a.name, locale)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('date')}</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">{t('note')}</label>
            <input
              className="input"
              placeholder={t('optional')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>}

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? t('saving') : t('save')}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
