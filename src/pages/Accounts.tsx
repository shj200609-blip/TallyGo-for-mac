import { useEffect, useState } from 'react'
import { listAccounts, createAccount, updateAccount, deleteAccount } from '../services/accountService'
import type { Account } from '../types'
import { formatMoney } from '../utils/format'
import PageHeader from '../components/common/PageHeader'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'
import type { MessageKey } from '../i18n/messages'

const TYPES: Array<{ value: string; labelKey: MessageKey; icon: string }> = [
  { value: 'cash', labelKey: 'cash', icon: '💵' },
  { value: 'bank', labelKey: 'bank', icon: '💳' },
  { value: 'alipay', labelKey: 'alipay', icon: '🔵' },
  { value: 'wechat', labelKey: 'wechat', icon: '🟢' },
  { value: 'credit', labelKey: 'credit', icon: '🔶' },
  { value: 'other', labelKey: 'other', icon: '🏦' },
]

export default function Accounts() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [list, setList] = useState<Account[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('cash')
  const [balance, setBalance] = useState('0')
  const [error, setError] = useState('')

  const load = () => listAccounts().then(setList)
  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setType('cash')
    setBalance('0')
    setError('')
    setShowForm(true)
  }

  const openEdit = (a: Account) => {
    setEditing(a)
    setName(a.name)
    setType(a.type)
    setBalance(String(a.balance))
    setError('')
    setShowForm(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('enterAccountName'))
      return
    }
    if (editing) {
      await updateAccount(editing.id, { name: name.trim(), balance: Number(balance) || 0 })
    } else {
      await createAccount({ name: name.trim(), type, balance: Number(balance) || 0 })
    }
    setShowForm(false)
    load()
  }

  const handleDelete = async (a: Account) => {
    if (!confirm(t('deleteAccountConfirm', { name: a.name }))) return
    const r = await deleteAccount(a.id)
    if (!r.ok && r.error) {
      const match = r.error.match(/(\d+)/)
      alert(match ? t('accountInUse', { n: match[1] }) : r.error)
    }
    load()
  }

  const total = list.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="p-6">
      <PageHeader title={t('accountsTitle')} actions={<button className="btn-primary" onClick={openCreate}>{t('addAccount')}</button>} />

      <div className="card mb-4">
        <div className="text-xs text-slate-500">{t('totalAssets')}</div>
        <div className="text-2xl font-bold mt-1">¥{formatMoney(total, locale)}</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {list.map((a) => {
          const meta = TYPES.find((tt) => tt.value === a.type) || TYPES[5]
          return (
            <div key={a.id} className="card group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{a.icon || meta.icon}</div>
                  <div>
                    <div className="font-medium">{displayName(a.name, locale)}</div>
                    <div className="text-xs text-slate-400">{t(meta.labelKey)}</div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs text-slate-400 hover:text-emerald-600" onClick={() => openEdit(a)}>
                    {t('edit')}
                  </button>
                  <button className="text-xs text-slate-400 hover:text-rose-600" onClick={() => handleDelete(a)}>
                    {t('delete')}
                  </button>
                </div>
              </div>
              <div className={`text-xl font-bold mt-3 ${a.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                ¥{formatMoney(a.balance, locale)}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={submit}
            className="bg-white rounded-xl p-6 w-96 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold">{editing ? t('editAccount') : t('newAccount')}</h2>
            <div>
              <label className="label">{t('name')}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            {!editing && (
              <div>
                <label className="label">{t('accountType')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((tt) => (
                    <button
                      key={tt.value}
                      type="button"
                      onClick={() => setType(tt.value)}
                      className={`py-2 rounded-lg border text-xs ${type === tt.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="text-lg">{tt.icon}</div>
                      {t(tt.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="label">{editing ? t('currentBalance') : t('initialBalance')}</label>
              <input type="number" step="0.01" className="input" value={balance} onChange={(e) => setBalance(e.target.value)} />
            </div>
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
