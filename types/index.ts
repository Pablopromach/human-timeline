export interface HistoricalFigure {
  id: number
  name: string
  birthYear: number
  deathYear: number
  country: string
  category: Category
  description: string
  wikipedia: string
  image?: string
  tags?: string[]
  relatedIds?: number[]
}

export type Category =
  | 'Politician'
  | 'Scientist'
  | 'Artist'
  | 'Writer'
  | 'Military Leader'
  | 'Philosopher'
  | 'Explorer'
  | 'Religious Figure'
  | 'Mathematician'
  | 'Inventor'
  | 'Musician'
  | 'Architect'
  | 'Athlete'
  | 'Filmmaker'

export interface TimelineBar {
  figure: HistoricalFigure
  color: string
  row: number
  isHovered: boolean
  isSelected: boolean
}

export interface Era {
  name: string
  startYear: number
  endYear: number
  color: string
  opacity: number
}

export interface Civilization {
  id: string
  name: string
  startYear: number
  endYear: number
  color: string
  description: string
}

export interface CoexistenceInfo {
  person1: HistoricalFigure
  person2: HistoricalFigure
  years: number
  overlapStart: number
  overlapEnd: number
}

export interface DensityData {
  century: number
  count: number
  label: string
}

export interface ZoomState {
  k: number
  x: number
  y: number
}

export interface SearchResult {
  figure: HistoricalFigure
  score: number
  matchedOn: string
}
