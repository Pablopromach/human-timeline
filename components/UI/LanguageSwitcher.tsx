'use client'
import { useTranslation } from '@/hooks/useLocale'
import { Locale, LOCALES } from '@/lib/i18n'

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useTranslation()

  return (
    <div
      className={`inline-flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 ${className}`}
    >
      {LOCALES.map(l => {
        const active = l === locale
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
            style={{
              background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)',
            }}
            aria-label={`Switch language to ${l.toUpperCase()}`}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
