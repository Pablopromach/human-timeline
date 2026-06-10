import { HistoricalFigure } from '@/types'

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function figureSlug(figure: HistoricalFigure): string {
  return slugify(figure.name)
}

export function findFigureBySlug(
  slug: string,
  figures: HistoricalFigure[]
): HistoricalFigure | undefined {
  return figures.find(f => figureSlug(f) === slug)
}
