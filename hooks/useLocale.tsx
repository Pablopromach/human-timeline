'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Locale, DEFAULT_LOCALE, LOCALES, translate, formatYear, formatYearShort } from '@/lib/i18n'
import { HistoricalFigure } from '@/types'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  fy: (year: number) => string
  fys: (year: number) => string
  fn: (figure: HistoricalFigure) => string
  fc: (category: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'human-timeline-locale'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    // Detect from localStorage first, then browser language
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored && LOCALES.includes(stored)) {
        setLocaleState(stored)
        document.documentElement.lang = stored
        return
      }
    } catch {}
    const browser = (navigator.language || '').slice(0, 2).toLowerCase() as Locale
    if (LOCALES.includes(browser)) {
      setLocaleState(browser)
      document.documentElement.lang = browser
    } else {
      document.documentElement.lang = DEFAULT_LOCALE
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale])
  const fy = useCallback((y: number) => formatYear(y, locale), [locale])
  const fys = useCallback((y: number) => formatYearShort(y, locale), [locale])
  const fn = useCallback((f: HistoricalFigure) => locale === 'es' && f.nameEs ? f.nameEs : f.name, [locale])
  const fc = useCallback((cat: string) => translate(locale, `cat.${cat}`), [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, fy, fys, fn, fc }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useTranslation must be used within LocaleProvider')
  return ctx
}
