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
    description: 'Empezando el camino',
  },
  {
    name: 'Plata',
    min: 20,
    color: '#c0c0c0',
    glow: 'rgba(192,192,192,0.4)',
    gradient: 'linear-gradient(135deg, #e8e8e8, #9e9e9e)',
    description: 'Vas por buen camino',
  },
  {
    name: 'Oro',
    min: 50,
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.4)',
    gradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    description: 'Buen conocedor de la historia',
  },
  {
    name: 'Platino',
    min: 90,
    color: '#a8d8ea',
    glow: 'rgba(168,216,234,0.4)',
    gradient: 'linear-gradient(135deg, #e0f0ff, #7ab8d4)',
    description: 'Experto en historia',
  },
  {
    name: 'Diamante',
    min: 140,
    color: '#67e8f9',
    glow: 'rgba(103,232,249,0.5)',
    gradient: 'linear-gradient(135deg, #b9f2ff, #0ea5e9)',
    description: 'Maestro del tiempo',
  },
  {
    name: 'Maestro',
    min: 200,
    color: '#f59e0b',
    glow: 'rgba(168,85,247,0.5)',
    gradient: 'linear-gradient(135deg, #f59e0b, #a855f7)',
    description: 'Leyenda histórica',
  },
]

export function getRank(score: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].min) return RANKS[i]
  }
  return RANKS[0]
}
