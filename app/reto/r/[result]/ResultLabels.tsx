'use client'
import Link from 'next/link'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useLocale'
import { TOTAL_ROUNDS } from '@/lib/game'

// IMPORTANT: each client component needs to be its own named export so that
// React Server Components can resolve them through the client manifest.
// Do NOT collect them in an object and access via dot-notation — RSC will
// throw "Could not find the module ... in the React Client Manifest" at runtime.

export function HeaderLabel() {
  const { t } = useTranslation()
  return (
    <div
      style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'DM Mono, monospace',
        marginTop: 2,
        letterSpacing: 2,
      }}
    >
      {t('result.header')}
    </div>
  )
}

export function HomeLink() {
  const { t } = useTranslation()
  return (
    <Link
      href="/reto"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        textDecoration: 'none',
      }}
    >
      <ArrowLeft size={13} />
      <span style={{ display: 'inline-block' }}>{t('common.home')}</span>
    </Link>
  )
}

export function RatingTitle({ score, color }: { score: number; color: string }) {
  const { t } = useTranslation()
  const pct = (score / (TOTAL_ROUNDS * 10)) * 100
  let labelKey = 'rating.review'
  if (pct >= 90) labelKey = 'rating.master'
  else if (pct >= 75) labelKey = 'rating.brilliant'
  else if (pct >= 55) labelKey = 'rating.advanced'
  else if (pct >= 35) labelKey = 'rating.curious'
  else if (pct >= 15) labelKey = 'rating.traveler'
  return (
    <h1
      style={{
        fontSize: 'clamp(28px, 8vw, 44px)',
        fontFamily: 'DM Serif Display, serif',
        fontStyle: 'italic',
        color,
        margin: '8px 0 12px',
        letterSpacing: -0.5,
        lineHeight: 1.05,
      }}
    >
      {t(labelKey)}
    </h1>
  )
}

export function ModeLabel({ mode, rounds }: { mode: 'clasico' | 'infinito'; rounds: string }) {
  const { t } = useTranslation()
  const modeLabel = mode === 'clasico' ? t('game.modeClassic') : t('game.modeInfinite')
  return (
    <span>
      {modeLabel}
      {rounds ? ` · ${rounds} ${t('game.rounds')}` : ''}
    </span>
  )
}

export function PlayButton() {
  const { t } = useTranslation()
  return (
    <Link
      href="/reto"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 22px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        textDecoration: 'none',
        boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
      }}
    >
      <Gamepad2 size={15} /> {t('result.playYourself')}
    </Link>
  )
}

export function Footer() {
  const { t } = useTranslation()
  return (
    <p
      style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 16,
        maxWidth: 380,
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: 1.5,
      }}
    >
      {t('result.footer')}
    </p>
  )
}
