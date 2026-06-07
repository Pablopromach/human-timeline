import { HistoricalFigure, CoexistenceInfo, DensityData, Era } from '@/types'

export const CATEGORY_COLORS: Record<string, string> = {
  'Político': '#ef4444',
  'Científico': '#06b6d4',
  'Artista': '#f59e0b',
  'Escritor': '#10b981',
  'Militar': '#8b5cf6',
  'Filósofo': '#6366f1',
  'Explorador': '#f97316',
  'Religioso': '#fb7185',
  'Matemático': '#22d3ee',
  'Inventor': '#a78bfa',
  'Músico': '#fbbf24',
  'Arquitecto': '#34d399',
}

export const ERAS: Era[] = [
  { name: 'Antiguo Egipto', startYear: -4000, endYear: -332, color: '#f59e0b', opacity: 0.04 },
  { name: 'Grecia Clásica', startYear: -800, endYear: -146, color: '#06b6d4', opacity: 0.05 },
  { name: 'Imperio Romano', startYear: -509, endYear: 476, color: '#ef4444', opacity: 0.04 },
  { name: 'Edad Media', startYear: 476, endYear: 1492, color: '#8b5cf6', opacity: 0.04 },
  { name: 'Renacimiento', startYear: 1300, endYear: 1600, color: '#f97316', opacity: 0.05 },
  { name: 'Ilustración', startYear: 1650, endYear: 1800, color: '#10b981', opacity: 0.05 },
  { name: 'Era Industrial', startYear: 1760, endYear: 1900, color: '#fbbf24', opacity: 0.04 },
  { name: 'Era Moderna', startYear: 1900, endYear: 2026, color: '#6366f1', opacity: 0.04 },
]

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#94a3b8'
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} a.C.`
  return `${year} d.C.`
}

export function calculateCoexistence(
  p1: HistoricalFigure,
  p2: HistoricalFigure
): CoexistenceInfo | null {
  const overlapStart = Math.max(p1.birthYear, p2.birthYear)
  const overlapEnd = Math.min(p1.deathYear, p2.deathYear)
  if (overlapEnd <= overlapStart) return null
  return {
    person1: p1,
    person2: p2,
    years: overlapEnd - overlapStart,
    overlapStart,
    overlapEnd,
  }
}

export function findRelatedFigures(
  person: HistoricalFigure,
  allFigures: HistoricalFigure[],
  limit = 6
): HistoricalFigure[] {
  return allFigures
    .filter(f => f.id !== person.id)
    .map(f => {
      let score = 0
      if (f.category === person.category) score += 3
      if (f.country === person.country) score += 2
      const overlap = calculateCoexistence(person, f)
      if (overlap) score += Math.min(overlap.years / 10, 3)
      const sharedTags = (person.tags ?? []).filter(t => (f.tags ?? []).includes(t)).length
      score += sharedTags
      if (person.relatedIds?.includes(f.id)) score += 5
      return { figure: f, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.figure)
}

export function getWhoWasAlive(
  year: number,
  figures: HistoricalFigure[]
): HistoricalFigure[] {
  return figures.filter(f => f.birthYear <= year && f.deathYear >= year)
}

export function calculateDensity(figures: HistoricalFigure[]): DensityData[] {
  const centuries: Record<number, number> = {}
  for (const f of figures) {
    const startC = Math.floor(f.birthYear / 100)
    const endC = Math.floor(f.deathYear / 100)
    for (let c = startC; c <= endC; c++) {
      centuries[c] = (centuries[c] ?? 0) + 1
    }
  }
  return Object.entries(centuries)
    .map(([c, count]) => {
      const century = Number(c)
      const label =
        century < 0
          ? `${Math.abs(century)}° s. a.C.`
          : `s. ${century + 1}`
      return { century, count, label }
    })
    .sort((a, b) => a.century - b.century)
}

export function assignRows(figures: HistoricalFigure[]): Map<number, number> {
  const sorted = [...figures].sort((a, b) => a.birthYear - b.birthYear)
  const rowEnds: number[] = []
  const rows = new Map<number, number>()
  for (const fig of sorted) {
    let placed = false
    for (let r = 0; r < rowEnds.length; r++) {
      if (rowEnds[r] < fig.birthYear - 5) {
        rows.set(fig.id, r)
        rowEnds[r] = fig.deathYear
        placed = true
        break
      }
    }
    if (!placed) {
      rows.set(fig.id, rowEnds.length)
      rowEnds.push(fig.deathYear)
    }
  }
  return rows
}
