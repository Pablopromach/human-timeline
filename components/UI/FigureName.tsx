'use client'
import { HistoricalFigure } from '@/types'
import { useTranslation } from '@/hooks/useLocale'

export function FigureName({ figure }: { figure: HistoricalFigure }) {
  const { fn } = useTranslation()
  return <>{fn(figure)}</>
}

export function FigureCategory({ category }: { category: string }) {
  const { fc } = useTranslation()
  return <>{fc(category)}</>
}

export function FigureDescription({ figure }: { figure: HistoricalFigure }) {
  const { locale } = useTranslation()
  return <>{locale === 'es' && figure.descriptionEs ? figure.descriptionEs : figure.description}</>
}

export default FigureName
