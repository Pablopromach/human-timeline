import { ImageResponse } from 'next/og'
import figuresData from '@/data/figures.json'
import { HistoricalFigure } from '@/types'
import { figureSlug, findFigureBySlug } from '@/lib/slug'
import { getCategoryColor, formatYear } from '@/lib/timelineUtils'

export const runtime = 'edge'
export const alt = 'Human Timeline'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const allFigures = figuresData as HistoricalFigure[]

export async function generateImageMetadata() {
  return allFigures.map(f => ({ id: figureSlug(f) }))
}

export default async function Image({ params }: { params: { slug: string } }) {
  const figure = findFigureBySlug(params.slug, allFigures)
  if (!figure) {
    return new ImageResponse(<div style={{ background: '#0a0a0f', width: '100%', height: '100%' }} />, size)
  }

  const color = getCategoryColor(figure.category)
  const MIN = -4000, MAX = 2026, total = MAX - MIN
  const startPct = ((figure.birthYear - MIN) / total) * 100
  const widthPct = Math.max(((figure.deathYear - figure.birthYear) / total) * 100, 0.5)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0f',
          backgroundImage: `radial-gradient(ellipse 100% 60% at 50% 0%, ${color}25 0%, transparent 60%)`,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Header strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700,
          }}>—</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.5 }}>Human Timeline</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: 2 }}>
              4000 a.C. — 2026
            </span>
          </div>
        </div>

        {/* Category chip */}
        <div style={{
          display: 'flex', alignSelf: 'flex-start',
          padding: '6px 14px', borderRadius: 999,
          background: `${color}30`, border: `1px solid ${color}66`,
          fontSize: 16, color, marginBottom: 24,
        }}>
          {figure.category} · {figure.country}
        </div>

        {/* Name */}
        <div style={{
          fontSize: 96, fontWeight: 700, lineHeight: 0.95,
          color: 'rgba(255,255,255,0.95)', letterSpacing: -2.5,
          marginBottom: 24, maxWidth: 1000,
        }}>
          {figure.name}
        </div>

        {/* Years */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 56, fontFamily: 'monospace' }}>
          <span style={{ fontSize: 28, color }}>{formatYear(figure.birthYear)}</span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }}>—</span>
          <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>{formatYear(figure.deathYear)}</span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginLeft: 16 }}>
            ({figure.deathYear - figure.birthYear} años)
          </span>
        </div>

        {/* Mini timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
          <div style={{
            position: 'relative', height: 12, borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', display: 'flex', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', height: '100%',
              left: `${startPct}%`, width: `${widthPct}%`,
              background: color, borderRadius: 6, boxShadow: `0 0 24px ${color}`,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
            <span>4000 a.C.</span><span>0</span><span>1000</span><span>2026</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
