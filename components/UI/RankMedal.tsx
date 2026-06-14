import { getRank, RANKS, type Rank } from '@/lib/ranks'

function buildStar(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const step = Math.PI / points
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * step - Math.PI / 2
    d += (i === 0 ? 'M' : 'L') + `${(cx + Math.cos(angle) * r).toFixed(2)},${(cy + Math.sin(angle) * r).toFixed(2)}`
  }
  return d + 'Z'
}

export function Medal({ rank, size = 64 }: { rank: Rank; size?: number }) {
  const id = rank.name.toLowerCase()

  if (rank.name === 'Maestro') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill={`url(#g-${id})`} opacity="0.15" />
        <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#g-${id})`} strokeWidth="2.5" />
        <path d="M14 40 L14 26 L22 34 L32 18 L42 34 L50 26 L50 40 Z" fill={`url(#g-${id})`} opacity="0.9" />
        <rect x="12" y="40" width="40" height="5" rx="2.5" fill={`url(#g-${id})`} />
        <circle cx="32" cy="32" r="4" fill="white" opacity="0.85" />
      </svg>
    )
  }

  if (rank.name === 'Diamante') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b9f2ff" /><stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill={`url(#g-${id})`} opacity="0.12" />
        <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#g-${id})`} strokeWidth="2.5" />
        <path d="M32 14 L46 28 L32 50 L18 28 Z" fill={`url(#g-${id})`} opacity="0.9" />
        <path d="M18 28 L32 14 L46 28 L32 32 Z" fill="white" opacity="0.3" />
        <path d="M18 28 L32 32 L32 50 Z" fill="white" opacity="0.12" />
      </svg>
    )
  }

  if (rank.name === 'Platino') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0f0ff" /><stop offset="100%" stopColor="#7ab8d4" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill={`url(#g-${id})`} opacity="0.12" />
        <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#g-${id})`} strokeWidth="2.5" />
        <circle cx="32" cy="32" r="16" fill={`url(#g-${id})`} opacity="0.3" />
        <circle cx="32" cy="32" r="16" fill="none" stroke={`url(#g-${id})`} strokeWidth="1.5" />
        <path d={buildStar(32, 32, 13, 6, 5)} fill={`url(#g-${id})`} />
      </svg>
    )
  }

  // Bronce, Plata, Oro
  const starPoints = rank.name === 'Oro' ? 5 : rank.name === 'Plata' ? 4 : 3
  const [c1, c2] = rank.name === 'Oro' ? ['#ffd700', '#ff8c00'] : rank.name === 'Plata' ? ['#e8e8e8', '#9e9e9e'] : ['#cd7f32', '#8b4513']
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#g-${id})`} opacity="0.18" />
      <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#g-${id})`} strokeWidth="3" />
      <circle cx="32" cy="32" r="21" fill={`url(#g-${id})`} opacity="0.25" />
      <path d={buildStar(32, 32, 14, 7, starPoints)} fill={`url(#g-${id})`} />
    </svg>
  )
}

export function RankBadge({ score, size = 64 }: { score: number; size?: number }) {
  const rank = getRank(score)
  return (
    <div className="flex flex-col items-center gap-1">
      <Medal rank={rank} size={size} />
      <span className="text-xs font-mono font-semibold" style={{ color: rank.color }}>{rank.name}</span>
    </div>
  )
}

export function RankScale({ currentScore }: { currentScore: number }) {
  const currentRank = getRank(currentScore)
  return (
    <div className="flex justify-between items-end w-full">
      {RANKS.map(r => {
        const isActive = r.name === currentRank.name
        return (
          <div key={r.name} className="flex flex-col items-center gap-1">
            <Medal rank={r} size={isActive ? 30 : 22} />
            <span className="text-[8px] font-mono transition-all"
              style={{ color: isActive ? r.color : 'rgba(255,255,255,0.2)', fontWeight: isActive ? 600 : 400 }}>
              {r.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { getRank }
