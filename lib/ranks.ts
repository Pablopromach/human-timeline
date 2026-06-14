export interface Rank {
  name: string
  min: number
  color: string
  glow: string
  gradient: string
  description: string
}

export const RANKS: Rank[] = [
  {
    name: 'Bronce',
    min: -Infinity,
    color: '#cd7f32',
    glow: 'rgba(205,127,50,0.4)',
    gradient: 'linear-gradient(135deg, #cd7f32, #8b4513)',
    description: '0 – 49 pts',
  },
  {
    name: 'Plata',
    min: 50,
    color: '#c0c0c0',
    glow: 'rgba(192,192,192,0.4)',
    gradient: 'linear-gradient(135deg, #e8e8e8, #9e9e9e)',
    description: '50 – 99 pts',
  },
  {
    name: 'Oro',
    min: 100,
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.4)',
    gradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    description: '100 – 149 pts',
  },
  {
    name: 'Platino',
    min: 150,
    color: '#a8d8ea',
    glow: 'rgba(168,216,234,0.4)',
    gradient: 'linear-gradient(135deg, #e0f0ff, #7ab8d4)',
    description: '150 – 199 pts',
  },
  {
    name: 'Diamante',
    min: 200,
    color: '#67e8f9',
    glow: 'rgba(103,232,249,0.5)',
    gradient: 'linear-gradient(135deg, #b9f2ff, #0ea5e9)',
    description: '200 – 249 pts',
  },
  {
    name: 'Maestro',
    min: 250,
    color: '#f59e0b',
    glow: 'rgba(168,85,247,0.5)',
    gradient: 'linear-gradient(135deg, #f59e0b, #a855f7)',
    description: '250+ pts',
  },
]

export function getRank(score: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].min) return RANKS[i]
  }
  return RANKS[0]
}
