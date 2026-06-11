import { HistoricalFigure, SearchResult } from '@/types'

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function score(query: string, text: string): number {
  const q = normalize(query)
  const t = normalize(text)
  if (t === q) return 100
  if (t.startsWith(q)) return 90
  if (t.includes(q)) return 70
  // partial word match
  const words = q.split(/\s+/)
  const matchedWords = words.filter(w => t.includes(w))
  if (matchedWords.length === words.length) return 60
  if (matchedWords.length > 0) return 30 * (matchedWords.length / words.length)
  return 0
}

export function searchFigures(
  query: string,
  figures: HistoricalFigure[],
  limit = 10
): SearchResult[] {
  if (!query.trim()) return []
  return figures
    .map(figure => {
      const nameScore = Math.max(score(query, figure.name), figure.nameEs ? score(query, figure.nameEs) : 0) * 2
      const countryScore = score(query, figure.country) * 0.5
      const categoryScore = score(query, figure.category) * 0.5
      const tagScore =
        (figure.tags ?? []).reduce((acc, t) => acc + score(query, t) * 0.3, 0)
      const descScore = score(query, figure.description) * 0.2
      const total = nameScore + countryScore + categoryScore + tagScore + descScore
      let matchedOn = 'name'
      if (nameScore < countryScore) matchedOn = 'country'
      if (Math.max(nameScore, countryScore) < categoryScore) matchedOn = 'category'
      return { figure, score: total, matchedOn }
    })
    .filter(r => r.score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
