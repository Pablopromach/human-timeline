'use client'
import Link from 'next/link'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useLocale'
import { getScoreRating, TOTAL_ROUNDS } from '@/lib/game'

function HeaderLabel() {
  const { t } = useTranslation()
  return (
    <div className="text-[9px] sm:text-[10px] text-white/30 font-mono mt-0.5 tracking-widest">
      {t('result.header')}
    </div>
  )
}

function HomeLink() {
  const { t } = useTranslation()
  return (
    <Link href="/reto" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/40 hover:text-white/75 transition-colors">
      <ArrowLeft size={13} />
      <span className="hidden sm:inline">{t('common.home')}</span>
    </Link>
  )
}

function RatingTitle({ score, color }: { score: number; color: string }) {
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
      className="text-3xl sm:text-4xl md:text-5xl mb-3 tracking-tight"
      style={{ fontFamily: 'var(--font-display)', color, fontStyle: 'italic' }}
    >
      {t(labelKey)}
    </h1>
  )
}

function ModeLabel({ mode, rounds }: { mode: 'clasico' | 'infinito'; rounds: string }) {
  const { t } = useTranslation()
  const modeLabel = mode === 'clasico' ? t('game.modeClassic') : t('game.modeInfinite')
  return (
    <div className="text-[10px] sm:text-xs text-white/40 font-mono uppercase tracking-widest">
      {modeLabel}{rounds ? ` · ${rounds} ${t('game.rounds')}` : ''}
    </div>
  )
}

function PlayButton() {
  const { t } = useTranslation()
  return (
    <Link
      href="/reto"
      className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
      }}
    >
      <Gamepad2 size={15} /> {t('result.playYourself')}
    </Link>
  )
}

function Footer() {
  const { t } = useTranslation()
  return (
    <p className="text-xs text-white/35 mt-10 sm:mt-12 max-w-sm mx-auto leading-relaxed">
      {t('result.footer')}
    </p>
  )
}

const ResultLabels = { HeaderLabel, HomeLink, RatingTitle, ModeLabel, PlayButton, Footer }
export default ResultLabels
