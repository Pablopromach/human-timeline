'use client'
import { CATEGORY_COLORS } from '@/lib/timelineUtils'

interface Props {
  active: string | null
  onChange: (cat: string | null) => void
  counts: Record<string, number>
}

export default function CategoryFilter({ active, onChange, counts }: Props) {
  const cats = Object.keys(counts).filter(c => counts[c] > 0)
  if (cats.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(null)}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          !active
            ? 'bg-white/12 text-white/85'
            : 'bg-white/5 text-white/35 hover:bg-white/8'
        }`}
      >
        Todos
      </button>
      {cats.map(cat => {
        const color = CATEGORY_COLORS[cat] ?? '#94a3b8'
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(isActive ? null : cat)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: isActive ? `${color}28` : 'rgba(255,255,255,0.04)',
              color: isActive ? color : 'rgba(255,255,255,0.4)',
              border: isActive ? `1px solid ${color}44` : '1px solid transparent',
            }}
          >
            {cat}
            <span className="ml-1.5 opacity-60 font-mono">{counts[cat]}</span>
          </button>
        )
      })}
    </div>
  )
}
