import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Human Timeline — 6000 años de historia humana'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0f',
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.25) 0%, transparent 60%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          color: 'white',
          fontFamily: 'sans-serif',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700,
          }}>—</div>
          <span style={{ fontSize: 22, fontWeight: 600 }}>Human Timeline</span>
        </div>

        {/* Center: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: -3, fontStyle: 'italic' }}>
            6.000 años
          </div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: -3, color: 'rgba(255,255,255,0.7)' }}>
            de historia humana
          </div>
          <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', marginTop: 12, maxWidth: 900 }}>
            Visualiza y compara las vidas de los personajes más influyentes de la historia
          </div>
        </div>

        {/* Bottom: sample bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { name: 'Cleopatra', start: 30, w: 6, color: '#ef4444' },
            { name: 'Leonardo da Vinci', start: 76, w: 4, color: '#f59e0b' },
            { name: 'Napoleón', start: 92, w: 3, color: '#8b5cf6' },
            { name: 'Albert Einstein', start: 96, w: 3, color: '#06b6d4' },
          ].map(b => (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 120, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{b.name}</div>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: `${b.start}%`, width: `${b.w}%`,
                  height: '100%', background: b.color, borderRadius: 4, boxShadow: `0 0 10px ${b.color}`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
