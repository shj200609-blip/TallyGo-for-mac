import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import RecordForm from './pages/RecordForm'
import Categories from './pages/Categories'
import Accounts from './pages/Accounts'
import Reports from './pages/Reports'
import Budgets from './pages/Budgets'
import Settings from './pages/Settings'
import { useI18n } from './i18n'
import { useTheme } from './store/theme'

export default function App() {
  const t = useI18n((s) => s.t)
  const locale = useI18n((s) => s.locale)
  const setLocale = useI18n((s) => s.setLocale)
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggle)

  const nav = [
    { to: '/', label: t('navHome'), icon: '🏠' },
    { to: '/records', label: t('navRecords'), icon: '📋' },
    { to: '/reports', label: t('navReports'), icon: '📊' },
    { to: '/budgets', label: t('navBudgets'), icon: '🎯' },
    { to: '/categories', label: t('navCategories'), icon: '🏷️' },
    { to: '/accounts', label: t('navAccounts'), icon: '💳' },
    { to: '/settings', label: t('navSettings'), icon: '⚙️' },
  ]

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-52 shrink-0 bg-slate-900 text-slate-200 flex flex-col">
          <div className="px-5 py-5 text-lg font-bold text-white tracking-wide">
            📒 TallyGo
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-3 py-3 border-t border-slate-800 space-y-2">
            <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
              <button
                className={`flex-1 py-1.5 ${locale === 'zh' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                onClick={() => setLocale('zh')}
              >
                中文
              </button>
              <button
                className={`flex-1 py-1.5 ${locale === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
              aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>
            </button>
            <div className="text-xs text-slate-500 px-1">{t('localOnly')}</div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<Records />} />
            <Route path="/records/new" element={<RecordForm />} />
            <Route path="/records/:id" element={<RecordForm />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
