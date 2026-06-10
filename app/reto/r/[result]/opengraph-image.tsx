import { ImageResponse } from 'next/og'
import { getScoreRating } from '@/lib/game'

export const runtime = 'edge'
export const alt = 'Resultado · Human Timeline'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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

export default async function Image({ params }: { params: { result: string } }) {
  const parsed = parseResult(params.result)
  if (!parsed) {
    return new ImageResponse(
      <div style={{ background: '#0a0a0f', width: '100%', height: '100%' }} />,
      size
    )
  }
  const { mode, score } = parsed
  const rating = getScoreRating(score)
  const modeLabel = mode === 'clasico' ? 'MODO CLÁSICO' : 'MODO INFINITO'
  const maxLabel = mode === 'clasico' ? '/ 100' : ''

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0f',
          backgroundImage: `radial-gradient(ellipse 90% 60% at 50% 40%, ${rating.color}33 0%, transparent 60%)`,
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
        {/* Top brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: 'white',
          }}>H</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Human Timeline</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: 2.5 }}>
              RETO HISTÓRICO
            </span>
          </div>
        </div>

        {/* Center: score */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flex: 1, marginTop: -40,
        }}>
          <div style={{ fontSize: 110, lineHeight: 1, marginBottom: 8 }}>{rating.emoji}</div>
          <div style={{
            fontSize: 44, fontWeight: 700, color: rating.color,
            fontStyle: 'italic', letterSpacing: -1, marginBottom: 24,
          }}>
            {rating.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{
              fontSize: 220, fontWeight: 800, lineHeight: 0.9,
              color: 'rgba(255,255,255,0.96)', letterSpacing: -8,
              fontFamily: 'monospace',
            }}>
              {score}
            </span>
            {maxLabel && (
              <span style={{
                fontSize: 56, fontWeight: 500,
                color: 'rgba(255,255,255,0.28)',
                fontFamily: 'monospace',
              }}>
                {maxLabel}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: mode + CTA */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '8px 16px',
            borderRadius: 999, background: `${rating.color}25`,
            border: `1px solid ${rating.color}55`,
            fontSize: 16, color: rating.color, fontWeight: 600,
            fontFamily: 'monospace', letterSpacing: 1.5,
          }}>
            {modeLabel}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 18, color: 'rgba(255,255,255,0.6)',
          }}>
            <span>¿Puedes superarlo?</span>
            <span style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)',
              color: '#a5b4fc', fontWeight: 600,
            }}>
              human-timeline.vercel.app/reto
            </span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
