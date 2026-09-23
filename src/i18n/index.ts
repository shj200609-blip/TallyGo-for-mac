import { create } from 'zustand'
import { locales, type Locale, type MessageKey } from './messages'

const STORAGE_KEY = 'tallygo-locale'

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'zh' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

export const useI18n = create<I18nState>((set, get) => ({
  locale: detectLocale(),
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    set({ locale })
  },
  t: (key, vars) => {
    const { locale } = get()
    let text: string = locales[locale][key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, String(v))
      }
    }
    return text
  },
}))

export function t(...args: Parameters<I18nState['t']>): string {
  return useI18n.getState().t(...args)
}
