import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import HumanTimelineIcon from '@/components/UI/HumanTimelineIcon'
import LanguageSwitcher from '@/components/UI/LanguageSwitcher'
import { getScoreRating } from '@/lib/game'
import { SITE, absoluteUrl } from '@/lib/seo'
import ShareButton from './ShareButton'
import ResultLabels from './ResultLabels'

interface Params {
  params: { result: string }
  searchParams: { rounds?: string }
}

function parseResult(result: string) {
  const idx = result.lastIndexOf('-')
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
  const modeLabel = mode === 'clasico' ? 'Modo Clásico' : 'Modo Infinito'
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

  return (
    <main className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--void)' }}>
      <header className="flex-shrink-0 border-b border-white/6 px-3 sm:px-5 py-2.5 sm:py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
            >
              <HumanTimelineIcon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-semibold text-white/90 leading-none truncate" style={{ fontFamily: 'var(--font-display)' }}>
                Human Timeline
              </div>
              <ResultLabels.HeaderLabel />
            </div>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ResultLabels.HomeLink />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 40% at 50% 35%, ${rating.color}22 0%, transparent 60%)` }}
        />

        <div className="relative max-w-xl w-full text-center">
          <div className="text-6xl sm:text-7xl mb-3 sm:mb-4">{rating.emoji}</div>
          <ResultLabels.RatingTitle score={score} color={rating.color} />
          <div className="text-6xl sm:text-7xl md:text-8xl font-bold font-mono mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {score}
            {mode === 'clasico' && <span className="text-white/25 text-3xl sm:text-4xl">/100</span>}
          </div>
          <ResultLabels.ModeLabel mode={mode} rounds={rounds} />

          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap mt-8 sm:mt-10">
            <ResultLabels.PlayButton />
            <ShareButton url={shareUrl} score={score} mode={mode} />
          </div>

          <ResultLabels.Footer />
        </div>
      </div>
    </main>
  )
}
