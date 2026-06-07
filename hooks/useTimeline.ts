'use client'
import { useState, useCallback, useMemo } from 'react'
import { HistoricalFigure } from '@/types'
import { calculateCoexistence, findRelatedFigures, getWhoWasAlive } from '@/lib/timelineUtils'
import figuresData from '@/data/figures.json'

const allFigures = figuresData as HistoricalFigure[]

export function useTimeline() {
  const [selectedFigures, setSelectedFigures] = useState<HistoricalFigure[]>([])
  const [hoveredFigure, setHoveredFigure] = useState<HistoricalFigure | null>(null)
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const addFigure = useCallback((figure: HistoricalFigure) => {
    setSelectedFigures(prev =>
      prev.find(f => f.id === figure.id) ? prev : [...prev, figure]
    )
  }, [])

  const removeFigure = useCallback((id: number) => {
    setSelectedFigures(prev => prev.filter(f => f.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setSelectedFigures([])
    setActiveYear(null)
  }, [])

  const coexistences = useMemo(() => {
    const pairs = []
    for (let i = 0; i < selectedFigures.length; i++) {
      for (let j = i + 1; j < selectedFigures.length; j++) {
        const cx = calculateCoexistence(selectedFigures[i], selectedFigures[j])
        if (cx) pairs.push(cx)
      }
    }
    return pairs
  }, [selectedFigures])

  const relatedFigures = useMemo(() => {
    if (hoveredFigure) {
      return findRelatedFigures(hoveredFigure, allFigures).filter(
        f => !selectedFigures.find(s => s.id === f.id)
      )
    }
    return []
  }, [hoveredFigure, selectedFigures])

  const aliveInYear = useMemo(() => {
    if (activeYear === null) return []
    return getWhoWasAlive(activeYear, allFigures)
  }, [activeYear])

  const filteredFigures = useMemo(() => {
    if (!categoryFilter) return selectedFigures
    return selectedFigures.filter(f => f.category === categoryFilter)
  }, [selectedFigures, categoryFilter])

  return {
    allFigures,
    selectedFigures: filteredFigures,
    allSelected: selectedFigures,
    hoveredFigure,
    activeYear,
    categoryFilter,
    coexistences,
    relatedFigures,
    aliveInYear,
    addFigure,
    removeFigure,
    clearAll,
    setHoveredFigure,
    setActiveYear,
    setCategoryFilter,
  }
}
