import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Clock, Globe, Tag } from 'lucide-react'
import LanguageSwitcher from '@/components/UI/LanguageSwitcher'
import FigureName, { FigureCategory, FigureDescription } from '@/components/UI/FigureName'
import figuresData from '@/data/figures.json'
import { HistoricalFigure } from '@/types'
import { figureSlug, findFigureBySlug } from '@/lib/slug'
import { getCategoryColor, formatYear, calculateCoexistence, findRelatedFigures } from '@/lib/timelineUtils'
import { SITE, absoluteUrl } from '@/lib/seo'

const allFigures = figuresData as HistoricalFigure[]

interface Params {
  params: { slug: string }
}

export async function generateStaticParams() {
  return allFigures.map(f => ({ slug: figureSlug(f) }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const figure = findFigureBySlug(params.slug, allFigures)
  if (!figure) return { title: 'No encontrado · Human Timeline' }

  const years = `${formatYear(figure.birthYear)} – ${formatYear(figure.deathYear)}`
  const title = `${figure.name} (${years}) · Human Timeline`
  const description = `${figure.name}, ${figure.category.toLowerCase()} de ${figure.country}. ${figure.description.slice(0, 140)}`
  const url = absoluteUrl(`/personaje/${params.slug}`)

  return {
    title,
    description,
    keywords: [
      figure.name, figure.category, figure.country,
      'historia', 'timeline', 'biografía', 'vida', ...(figure.tags ?? []),
    ],
    alternates: { canonical: url },
    openGraph: {
      title, description, url,
      type: 'profile',
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: figure.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title, description,
      images: [`${url}/opengraph-image`],
    },
  }
}

export default function PersonajePage({ params }: Params) {
  const figure = findFigureBySlug(params.slug, allFigures)
  if (!figure) notFound()

  const color = getCategoryColor(figure.category)
  const ageAtDeath = figure.deathYear - figure.birthYear
  const related = findRelatedFigures(figure, allFigures, 8)
  const contemporaries = allFigures
    .filter(f => f.id !== figure.id)
    .map(f => {
      const cx = calculateCoexistence(figure, f)
      return cx ? { figure: f, years: cx.years } : null
    })
    .filter((x): x is { figure: HistoricalFigure; years: number } => x !== null)
    .sort((a, b) => b.years - a.years)
    .slice(0, 12)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: figure.name,
    description: figure.description,
    birthDate: figure.birthYear < 0 ? `-${String(Math.abs(figure.birthYear)).padStart(4, '0')}` : String(figure.birthYear).padStart(4, '0'),
    deathDate: figure.deathYear < 0 ? `-${String(Math.abs(figure.deathYear)).padStart(4, '0')}` : String(figure.deathYear).padStart(4, '0'),
    nationality: figure.country,
    jobTitle: figure.category,
    sameAs: [figure.wikipedia],
    url: absoluteUrl(`/personaje/${params.slug}`),
  }

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: figure.category, item: absoluteUrl(`/?categoria=${encodeURIComponent(figure.category)}`) },
      { '@type': 'ListItem', position: 3, name: figure.name, item: absoluteUrl(`/personaje/${params.slug}`) },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="min-h-screen overflow-y-auto" style={{ background: 'var(--void)', height: 'auto' }}>
        {/* Ambient color glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${color}18 0%, transparent 60%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors font-mono"
            >
              <ArrowLeft size={12} />
              VOLVER · BACK
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background: `${color}1f`, color, border: `1px solid ${color}33` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <FigureCategory category={figure.category} />
              </span>
              <span className="text-white/30 text-xs flex items-center gap-1">
                <Globe size={11} /> {figure.country}
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-7xl leading-[0.95] mb-4 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.95)' }}
            >
              <FigureName figure={figure} />
            </h1>

            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-white/40 font-mono text-sm">
              <span>
                <span className="text-white/30 text-xs uppercase tracking-widest mr-2">Nacimiento</span>
                <span style={{ color }}>{formatYear(figure.birthYear)}</span>
              </span>
              <span>
                <span className="text-white/30 text-xs uppercase tracking-widest mr-2">Muerte</span>
                <span className="text-white/65">{formatYear(figure.deathYear)}</span>
              </span>
              <span>
                <span className="text-white/30 text-xs uppercase tracking-widest mr-2">Edad</span>
                <span className="text-white/65">{ageAtDeath} años</span>
              </span>
            </div>
          </header>

          {/* Mini-timeline visualization */}
          <section className="glass rounded-2xl p-6 mb-12 overflow-hidden">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-white/30 tracking-widest uppercase">
              <Clock size={11} /> Línea de vida
            </div>
            <MiniTimeline figure={figure} color={color} />
          </section>

          {/* Biography */}
          <section className="mb-12">
            <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
              Biografía
            </h2>
            <p className="text-lg text-white/75 leading-relaxed"><FigureDescription figure={figure} /></p>
          </section>

          {/* Tags */}
          {figure.tags && figure.tags.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                <Tag size={11} /> Etiquetas
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {figure.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/45">
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Contemporaries */}
          {contemporaries.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-4">
                Coetáneos · Vivieron al mismo tiempo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contemporaries.map(({ figure: c, years }) => (
                  <Link
                    key={c.id}
                    href={`/personaje/${figureSlug(c)}`}
                    className="glass rounded-xl p-3 hover:bg-white/8 transition-colors flex items-center gap-3"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: getCategoryColor(c.category) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white/80 font-medium truncate"><FigureName figure={c} /></div>
                      <div className="text-[10px] text-white/30 font-mono">
                        {formatYear(c.birthYear)} – {formatYear(c.deathYear)}
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-mono px-2 py-0.5 rounded"
                      style={{ background: `${getCategoryColor(c.category)}1a`, color: getCategoryColor(c.category) }}
                    >
                      {years} años
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-4">
                Relacionados
              </h2>
              <div className="flex flex-wrap gap-2">
                {related.map(r => {
                  const rc = getCategoryColor(r.category)
                  return (
                    <Link
                      key={r.id}
                      href={`/personaje/${figureSlug(r)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:scale-[1.03]"
                      style={{ background: `${rc}15`, color: rc, border: `1px solid ${rc}28` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: rc }} />
                      <FigureName figure={r} />
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* External links */}
          <section className="border-t border-white/8 pt-8 flex flex-wrap gap-3">
            <Link
              href={`/?add=${params.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: `linear-gradient(135deg, ${color}33, ${color}1a)`,
                color: 'white',
                border: `1px solid ${color}55`,
              }}
            >
              Añadir al Timeline
            </Link>
            <a
              href={figure.wikipedia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80 transition-all"
            >
              <ExternalLink size={13} />
              Wikipedia
            </a>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-6 border-t border-white/5 text-[11px] text-white/25 font-mono">
            Human Timeline · {allFigures.length} personajes históricos · 4000 a.C. — 2026
          </footer>
        </div>
      </main>
    </>
  )
}

function MiniTimeline({ figure, color }: { figure: HistoricalFigure; color: string }) {
  const MIN = -4000, MAX = 2026
  const total = MAX - MIN
  const startPct = ((figure.birthYear - MIN) / total) * 100
  const widthPct = ((figure.deathYear - figure.birthYear) / total) * 100

  return (
    <div className="relative">
      <div className="relative h-8 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="absolute h-full rounded-md"
          style={{
            left: `${startPct}%`,
            width: `${Math.max(widthPct, 0.5)}%`,
            background: color,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-mono text-white/25">
        <span>4000 a.C.</span>
        <span>0</span>
        <span>1000</span>
        <span>2026</span>
      </div>
    </div>
  )
}
