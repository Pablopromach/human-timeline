import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import HumanTimelineIcon from '@/components/UI/HumanTimelineIcon'
import LanguageSwitcher from '@/components/UI/LanguageSwitcher'
import { getScoreRating, TOTAL_ROUNDS } from '@/lib/game'
import { SITE, absoluteUrl } from '@/lib/seo'
import ShareButton from './ShareButton'
import {
  HeaderLabel,
  HomeLink,
  RatingTitle,
  ModeLabel,
  PlayButton,
  Footer as ResultFooter,
} from './ResultLabels'

interface Params {
  params: { result: string }
  searchParams: { rounds?: string }
}

function parseResult(result: string) {
  const idx = result.indexOf('-')
  if (idx === -1) return null
  const modeSlug = result.slice(0, idx)
  const scoreStr = result.slice(idx + 1)
  const score = parseInt(scoreStr, 10)
  if (isNaN(score)) return null
  if (modeSlug !== 'clasico' && modeSlug !== 'infinito') return null
  return { mode: modeSlug as 'clasico' | 'infinito', score }
}

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const parsed = parseResult(params.result)
  if (!parsed) return { title: 'Reto · Human Timeline' }
  const { mode, score } = parsed
  const rating = getScoreRating(score)
  const rounds = searchParams.rounds ?? ''

  const title = `${score} puntos · ${rating.label} ${rating.emoji}`
  const description = mode === 'clasico'
    ? `He conseguido ${score}/100 puntos en el Reto Histórico de Human Timeline. ¿Puedes superarlo?`
    : `He aguantado ${rounds || 'varias'} rondas con ${score} puntos en el modo Infinito de Human Timeline. ¿Aguantas tú más?`

  const url = absoluteUrl(`/reto/r/${params.result}${rounds ? `?rounds=${rounds}` : ''}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${score} pts · ${rating.label}`,
      description, url, type: 'article',
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: `${score} puntos` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${score} pts en Human Timeline`,
      description,
      images: [`${url}/opengraph-image`],
    },
  }
}

export default function ResultPage({ params, searchParams }: Params) {
  const parsed = parseResult(params.result)
  if (!parsed) notFound()
  const { mode, score } = parsed
  const rating = getScoreRating(score)
  const rounds = searchParams.rounds ?? ''
  const shareUrl = absoluteUrl(`/reto/r/${params.result}${rounds ? `?rounds=${rounds}` : ''}`)
  const modeLabelStatic = mode === 'clasico' ? 'Modo Clásico · Classic Mode' : 'Modo Infinito · Infinite Mode'

  return (
    <div
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage: `radial-gradient(ellipse 90% 50% at 50% 30%, ${rating.color}22 0%, transparent 60%)`,
        color: 'rgba(255,255,255,0.95)',
        minHeight: '100vh',
        width: '100%',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        display: 'block',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px',
          background: 'rgba(10,10,15,0.85)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Link
            href="/reto"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
              color: 'inherit',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HumanTimelineIcon size={20} className="text-white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1,
                  fontFamily: 'DM Serif Display, serif',
                }}
              >
                Human Timeline
              </div>
              <HeaderLabel />
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <HomeLink />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div
        style={{
          padding: '48px 16px 64px',
          textAlign: 'center',
          maxWidth: '32rem',
          margin: '0 auto',
        }}
      >
        {/* Emoji */}
        <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 16 }}>{rating.emoji}</div>

        {/* Rating title (client component for i18n) */}
        <RatingTitle score={score} color={rating.color} />

        {/* Score */}
        <div
          style={{
            fontSize: 'clamp(64px, 18vw, 112px)',
            fontWeight: 700,
            fontFamily: 'DM Mono, monospace',
            color: 'rgba(255,255,255,0.96)',
            lineHeight: 1,
            margin: '4px 0 8px',
          }}
        >
          {score}
          {mode === 'clasico' && (
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.45em', fontWeight: 600 }}>
              /{TOTAL_ROUNDS * 10}
            </span>
          )}
        </div>

        {/* Mode label */}
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'DM Mono, monospace',
            marginBottom: 36,
          }}
        >
          <ModeLabel mode={mode} rounds={rounds} />
        </div>

        {/* Static fallback (always visible even if JS fails) */}
        <noscript>
          <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 14 }}>
            {modeLabelStatic}
          </div>
        </noscript>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 48,
          }}
        >
          <PlayButton />
          <ShareButton url={shareUrl} score={score} mode={mode} />
        </div>

        {/* Footer text */}
        <ResultFooter />
      </div>
    </div>
  )
}
