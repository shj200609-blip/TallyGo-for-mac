import { useEffect, useRef, useState } from 'react'
import { monthLabel, shiftMonth, currentMonth } from '../../utils/format'
import { useI18n } from '../../i18n'

interface Props {
  value: string
  onChange: (month: string) => void
}

const MONTHS_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MonthPicker({ value, onChange }: Props) {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const [y, m] = value.split('-').map(Number)
  const year = y || new Date().getFullYear()
  const monthIdx = (m || 1) - 1

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const years: number[] = []
  const now = new Date().getFullYear()
  for (let yy = now + 1; yy >= now - 15; yy--) years.push(yy)

  const pick = (yy: number, mm: number) => {
    onChange(`${yy}-${String(mm + 1).padStart(2, '0')}`)
    setOpen(false)
  }

  const months = locale === 'zh' ? MONTHS_ZH : MONTHS_EN

  return (
    <div className="flex items-center gap-2" ref={rootRef}>
      <button className="btn-ghost" onClick={() => onChange(shiftMonth(value, -1))}>
        {t('prevMonth')}
      </button>

      <div className="relative">
        <button
          type="button"
          className="input w-[150px] text-center font-medium cursor-pointer flex items-center justify-center gap-1"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span>{monthLabel(value, locale)}</span>
          <span className="text-slate-400 text-xs">▾</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg p-3 w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                className="btn-ghost !px-2 !py-1 text-xs"
                onClick={() => pick(year - 1, monthIdx)}
              >
                «
              </button>
              <span className="text-sm font-semibold">{year}</span>
              <button
                type="button"
                className="btn-ghost !px-2 !py-1 text-xs"
                onClick={() => pick(year + 1, monthIdx)}
              >
                »
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {months.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(year, i)}
                  className={`py-1.5 rounded-lg text-xs transition-colors ${
                    year === y && i === monthIdx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                className="text-xs text-emerald-600 hover:underline"
                onClick={() => {
                  onChange(currentMonth())
                  setOpen(false)
                }}
              >
                {t('thisMonth')}
              </button>
              <button type="button" className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setOpen(false)}>
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="btn-ghost" onClick={() => onChange(shiftMonth(value, 1))}>
        {t('nextMonth')}
      </button>
      <button className="btn-ghost" onClick={() => onChange(currentMonth())}>
        {t('thisMonth')}
      </button>
    </div>
  )
}
