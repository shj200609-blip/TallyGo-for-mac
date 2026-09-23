import { useState } from 'react'
import { exportData, importData } from '../services/importExportService'
import PageHeader from '../components/common/PageHeader'
import { useI18n } from '../i18n'
import { useTheme } from '../store/theme'

export default function Settings() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const setLocale = useI18n((s) => s.setLocale)
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<{ ok: boolean; error?: string; count?: number }>, action: string) => {
    setBusy(true)
    setMsg('')
    try {
      const r = await fn()
      if (r.ok) {
        setMsg(
          r.count !== undefined
            ? t(locale === 'zh' ? 'importSuccess' : 'exportSuccess', { action, count: r.count })
            : t('exportOk', { action })
        )
      } else {
        setMsg(r.error || t('canceled'))
      }
    } catch (e: unknown) {
      const detail = e instanceof Error ? e.message : String(e)
      setMsg(t('actionFailed', { action, msg: detail }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title={t('settingsTitle')} />

      <div className="space-y-4">
        <div className="card">
          <div className="font-medium mb-1">{t('language')}</div>
          <div className="flex gap-2 mt-2">
            <button
              className={locale === 'zh' ? 'btn bg-emerald-600 text-white' : 'btn-ghost'}
              onClick={() => setLocale('zh')}
            >
              中文
            </button>
            <button
              className={locale === 'en' ? 'btn bg-emerald-600 text-white' : 'btn-ghost'}
              onClick={() => setLocale('en')}
            >
              English
            </button>
          </div>
        </div>

        <div className="card">
          <div className="font-medium mb-1">{t('theme')}</div>
          <p className="text-sm text-slate-500 mb-3">{t('themeDesc')}</p>
          <div className="flex gap-2">
            <button
              className={theme === 'light' ? 'btn bg-emerald-600 text-white' : 'btn-ghost'}
              onClick={() => setTheme('light')}
            >
              ☀️ {t('lightMode')}
            </button>
            <button
              className={theme === 'dark' ? 'btn bg-emerald-600 text-white' : 'btn-ghost'}
              onClick={() => setTheme('dark')}
            >
              🌙 {t('darkMode')}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="font-medium mb-1">{t('dataExport')}</div>
          <p className="text-sm text-slate-500 mb-3">{t('dataExportDesc')}</p>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy} onClick={() => run(() => exportData('json'), t('exportJson'))}>
              {t('exportJson')}
            </button>
            <button className="btn-ghost" disabled={busy} onClick={() => run(() => exportData('csv'), t('exportCsv'))}>
              {t('exportCsv')}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="font-medium mb-1">{t('dataImport')}</div>
          <p className="text-sm text-slate-500 mb-3">{t('dataImportDesc')}</p>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy} onClick={() => run(() => importData('json'), t('importJson'))}>
              {t('importJson')}
            </button>
            <button className="btn-ghost" disabled={busy} onClick={() => run(() => importData('csv'), t('importCsv'))}>
              {t('importCsv')}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="font-medium mb-1">{t('localData')}</div>
          <p className="text-sm text-slate-500">{t('localDataDesc')}</p>
        </div>

        <div className="card">
          <div className="font-medium mb-1">{t('about')}</div>
          <p className="text-sm text-slate-500">{t('aboutDesc')}</p>
        </div>

        {msg && <div className="text-sm bg-slate-100 rounded-lg px-3 py-2 text-slate-700">{msg}</div>}
      </div>
    </div>
  )
}
