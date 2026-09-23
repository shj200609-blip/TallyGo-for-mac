import { useEffect, useState } from 'react'
import { listCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'
import type { Category } from '../types'
import PageHeader from '../components/common/PageHeader'
import { useI18n } from '../i18n'
import { displayName } from '../i18n/display'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#64748b']
const ICONS = ['🍜', '🚗', '🛒', '🎮', '🏠', '💊', '📚', '📱', '📦', '💰', '🎁', '📈', '💵', '☕', '✈️', '🐱', '👶', '💡']

export default function Categories() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [list, setList] = useState<Category[]>([])
  const [tab, setTab] = useState<'expense' | 'income'>('expense')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState('')

  const load = () => listCategories().then(setList)
  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setIcon(ICONS[0])
    setColor(COLORS[0])
    setError('')
    setShowForm(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setName(c.name)
    setIcon(c.icon || ICONS[0])
    setColor(c.color || COLORS[0])
    setError('')
    setShowForm(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('enterName'))
      return
    }
    if (editing) {
      await updateCategory(editing.id, { name: name.trim(), icon, color })
    } else {
      await createCategory({ name: name.trim(), type: tab, icon, color })
    }
    setShowForm(false)
    load()
  }

  const handleDelete = async (c: Category) => {
    if (!confirm(t('deleteCategoryConfirm', { name: c.name }))) return
    const r = await deleteCategory(c.id)
    if (!r.ok && r.error) {
      const match = r.error.match(/(\d+)/)
      alert(match ? t('categoryInUse', { n: match[1] }) : r.error)
    }
    load()
  }

  const filtered = list.filter((c) => c.type === tab)

  return (
    <div className="p-6">
      <PageHeader title={t('categoriesTitle')} actions={<button className="btn-primary" onClick={openCreate}>{t('addCategory')}</button>} />

      <div className="flex gap-2 mb-4">
        <button className={tab === 'expense' ? 'btn bg-rose-50 text-rose-600' : 'btn-ghost'} onClick={() => setTab('expense')}>
          {t('expenseCategories')}
        </button>
        <button className={tab === 'income' ? 'btn bg-emerald-50 text-emerald-600' : 'btn-ghost'} onClick={() => setTab('income')}>
          {t('incomeCategories')}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="card flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: (c.color || '#94a3b8') + '22' }}
              >
                {c.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{displayName(c.name, locale)}</div>
                <div className="text-xs text-slate-400">{c.is_default ? t('default') : t('custom')}</div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-slate-400 hover:text-emerald-600" onClick={() => openEdit(c)}>
                {t('edit')}
              </button>
              {!c.is_default && (
                <button className="text-xs text-slate-400 hover:text-rose-600" onClick={() => handleDelete(c)}>
                  {t('delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={submit}
            className="bg-white rounded-xl p-6 w-96 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold">{editing ? t('editCategory') : t('newCategory')}</h2>
            <div>
              <label className="label">{t('name')}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="label">{t('icon')}</label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-9 h-9 rounded-lg text-lg border ${icon === i ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{t('color')}</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-slate-800' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
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
