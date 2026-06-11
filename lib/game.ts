import { HistoricalFigure } from '@/types'
import figuresData from '@/data/figures.json'

const allFigures = figuresData as HistoricalFigure[]

// Pre-compute years with sufficient density of historical figures.
// We only sample target years where >=12 figures were alive.
const YEAR_STEP = 5
const MIN_ALIVE = 12
const SAMPLE_FROM = -400
const SAMPLE_TO = 2010

function aliveCount(year: number): number {
  let count = 0
  for (const f of allFigures) {
    if (f.birthYear <= year && f.deathYear >= year) count++
  }
  return count
}

const goodYearsCache: number[] = (() => {
  const years: number[] = []
  for (let y = SAMPLE_FROM; y <= SAMPLE_TO; y += YEAR_STEP) {
    if (aliveCount(y) >= MIN_ALIVE) years.push(y)
  }
  // Fallback: if dataset is too small, broaden criteria
  if (years.length < 30) {
    for (let y = SAMPLE_FROM; y <= SAMPLE_TO; y += YEAR_STEP) {
      if (aliveCount(y) >= 6) years.push(y)
    }
  }
  return years
})()

export function getRandomTargetYear(exclude: number[] = []): number {
  const pool = goodYearsCache.filter(y => !exclude.some(e => Math.abs(e - y) < 30))
  const arr = pool.length > 0 ? pool : goodYearsCache
  // Years >= 1950 are 5x less likely to appear (fewer notable figures)
  const weighted: number[] = []
  for (const y of arr) {
    const times = y >= 1950 ? 1 : 5
    for (let i = 0; i < times; i++) weighted.push(y)
  }
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export interface ScoreResult {
  points: number
  status: 'perfect' | 'close' | 'fair' | 'far' | 'wrong'
  distance: number
  message: string
}

export function scoreAnswer(figure: HistoricalFigure, targetYear: number): ScoreResult {
  // Alive in the target year → max points
  if (figure.birthYear <= targetYear && figure.deathYear >= targetYear) {
    return {
      points: 10,
      status: 'perfect',
      distance: 0,
      message: '¡Estaba vivo!',
    }
  }
  const distance = Math.min(
    Math.abs(targetYear - figure.birthYear),
    Math.abs(targetYear - figure.deathYear)
  )
  if (distance <= 25) {
    return {
      points: 5,
      status: 'close',
      distance,
      message: `Muy cerca · ${distance} años de diferencia`,
    }
  }
  if (distance <= 75) {
    return {
      points: 2,
      status: 'close',
      distance,
      message: `Cerca · ${distance} años de diferencia`,
    }
  }
  if (distance <= 200) {
    return {
      points: 0,
      status: 'fair',
      distance,
      message: `${distance} años de diferencia`,
    }
  }
  if (distance <= 500) {
    return {
      points: -3,
      status: 'far',
      distance,
      message: `Lejos · ${distance} años`,
    }
  }
  if (distance <= 1500) {
    return {
      points: -6,
      status: 'far',
      distance,
      message: `Muy lejos · ${distance} años`,
    }
  }
  return {
    points: -10,
    status: 'wrong',
    distance,
    message: `Era equivocada · ${distance} años`,
  }
}

export const TOTAL_ROUNDS = 10
export const MAX_POSSIBLE_SCORE = TOTAL_ROUNDS * 10

export function getScoreRating(score: number): { label: string; emoji: string; color: string } {
  const pct = (score / MAX_POSSIBLE_SCORE) * 100
  if (pct >= 90) return { label: 'Maestro de la Historia', emoji: '👑', color: '#f59e0b' }
  if (pct >= 75) return { label: 'Historiador Brillante', emoji: '🎓', color: '#a855f7' }
  if (pct >= 55) return { label: 'Aprendiz Avanzado', emoji: '📚', color: '#06b6d4' }
  if (pct >= 35) return { label: 'Curioso del Tiempo', emoji: '🔍', color: '#10b981' }
  if (pct >= 15) return { label: 'Viajero Perdido', emoji: '🗺️', color: '#94a3b8' }
  return { label: 'Necesitas Repasar', emoji: '📖', color: '#ef4444' }
}
