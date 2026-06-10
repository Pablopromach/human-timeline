'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Trash2, ChevronDown, GitCommitHorizontal, Crown } from 'lucide-react'
import { useTimeline } from '@/hooks/useTimeline'
import { findFigureBySlug } from '@/lib/slug'
import civilizationsData from '@/data/civilizations.json'
import { Civilization } from '@/types'
import TimelineChart from '@/components/Timeline/TimelineChart'
import SearchBar from '@/components/Search/SearchBar'
import PersonCard from '@/components/UI/PersonCard'
import CoexistenceTooltip from '@/components/UI/CoexistenceTooltip'
import CategoryFilter from '@/components/UI/CategoryFilter'
import WhoWasAlive from '@/components/Features/WhoWasAlive'
import RelatedFigures from '@/components/Features/RelatedFigures'
import { HistoricalFigure } from '@/types'

export default function HomePage() {
  const {
    allFigures,
    selectedFigures,
    allSelected,
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
  } = useTimeline()

  const [selectedCard, setSelectedCard] = useState<HistoricalFigure | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [showCivilizations, setShowCivilizations] = useState(false)
  const civilizations = (civilizationsData as Civilization[])

  // Deep-link: ?add=napoleon-bonaparte or ?add=slug1,slug2,slug3
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const add = params.get('add')
    if (add) {
      const slugs = add.split(',').map(s => s.trim()).filter(Boolean)
      let any = false
      for (const slug of slugs) {
        const fig = findFigureBySlug(slug, allFigures)
        if (fig) { addFigure(fig); any = true }
      }
      if (any) setShowIntro(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const f of allSelected) {
      counts[f.category] = (counts[f.category] ?? 0) + 1
    }
    return counts
  }, [allSelected])

  const handleSelectFigure = useCallback((fig: HistoricalFigure) => {
    setSelectedCard(fig)
  }, [])

  const handleRandom = useCallback(() => {
    const unselected = allFigures.filter(f => !allSelected.find(s => s.id === f.id))
    if (unselected.length === 0) return
    const pick = unselected[Math.floor(Math.random() * unselected.length)]
    addFigure(pick)
    setShowIntro(false)
  }, [allFigures, allSelected, addFigure])

  const handleAdd = useCallback((fig: HistoricalFigure) => {
    addFigure(fig)
    setShowIntro(false)
  }, [addFigure])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/6 px-5 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <GitCommitHorizontal size={16} className="text-white" />
              </div>
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
              />
            </div>
            <div>
              <h1
                className="text-base font-semibold tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.9)' }}
              >
                Human Timeline
              </h1>
              <p className="text-[10px] text-white/30 font-mono mt-0.5 tracking-widest">
                4000 a.C. — 2026 d.C.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <SearchBar
              allFigures={allFigures}
              selectedIds={allSelected.map(f => f.id)}
              onAdd={handleAdd}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCivilizations(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: showCivilizations ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)',
                color: showCivilizations ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                border: showCivilizations ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
              }}
            >
              <Crown size={13} />
              Civilizaciones
            </button>
            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
            >
              <Shuffle size={13} />
              Aleatorio
            </button>
            {allSelected.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <Trash2 size={13} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Intro state */}
      <AnimatePresence>
        {showIntro && allSelected.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            style={{ top: 73 }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center px-6 pointer-events-auto"
            >
              <h2
                className="text-5xl md:text-6xl mb-4 leading-none tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(255,255,255,0.88)',
                  fontStyle: 'italic',
                }}
              >
                6.000 años<br />de historia humana
              </h2>
              <p className="text-white/35 text-base mb-8 max-w-md mx-auto leading-relaxed">
                Busca cualquier personaje histórico y visualiza su vida en el tiempo.
                Descubre quiénes coexistieron, se conocieron o marcaron la misma era.
              </p>

              {/* Quick add chips */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {['Julio César', 'Napoleón Bonaparte', 'Albert Einstein', 'Cleopatra VII', 'Leonardo da Vinci'].map(name => {
                  const fig = allFigures.find(f => f.name === name)
                  if (!fig) return null
                  return (
                    <motion.button
                      key={name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAdd(fig)}
                      className="px-4 py-2 rounded-full text-sm glass border border-white/10 text-white/65 hover:text-white/90 hover:border-white/20 transition-all"
                    >
                      {name}
                    </motion.button>
                  )
                })}
              </div>

              <button
                onClick={handleRandom}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#a5b4fc',
                }}
              >
                <Shuffle size={14} />
                Personaje aleatorio
              </button>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 text-white/20"
            >
              <ChevronDown size={20} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Filters row */}
          {allSelected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-b border-white/5 px-5 py-2.5 flex items-center gap-4"
            >
              <CategoryFilter
                active={categoryFilter}
                onChange={setCategoryFilter}
                counts={categoryCounts}
              />
              <span className="text-[10px] text-white/20 font-mono ml-auto">
                {selectedFigures.length} personaje{selectedFigures.length !== 1 ? 's' : ''}
                {' · '}
                <span className="text-white/30">Rueda para zoom · Arrastra para mover · Clic en eje para ver quién vivía</span>
              </span>
            </motion.div>
          )}

          {/* Chart */}
          <div className="flex-1 overflow-auto">
            <TimelineChart
              figures={selectedFigures}
              civilizations={showCivilizations ? civilizations : []}
              onHover={setHoveredFigure}
              onYearClick={year => { setActiveYear(year); setShowIntro(false) }}
              onSelectFigure={handleSelectFigure}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <AnimatePresence>
          {(selectedCard || coexistences.length > 0 || relatedFigures.length > 0 || activeYear !== null) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 border-l border-white/6 overflow-y-auto overflow-x-hidden"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              <div className="p-4 space-y-4 min-w-[300px]">
                {/* Person card */}
                <PersonCard
                  figure={selectedCard}
                  onClose={() => setSelectedCard(null)}
                  onAdd={fig => { addFigure(fig); setSelectedCard(null) }}
                />

                {/* Who was alive */}
                <WhoWasAlive
                  year={activeYear}
                  figures={aliveInYear}
                  selectedIds={allSelected.map(f => f.id)}
                  onAdd={handleAdd}
                  onClose={() => setActiveYear(null)}
                />

                {/* Coexistences */}
                <CoexistenceTooltip coexistences={coexistences} />

                {/* Related figures */}
                {hoveredFigure && (
                  <RelatedFigures
                    figures={relatedFigures}
                    sourceName={hoveredFigure.name}
                    onAdd={handleAdd}
                  />
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-white/4 px-5 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <p className="text-[11px] text-white/18 font-mono">
            {allFigures.length} personajes · 4000 a.C. — 2026
          </p>
          <div className="flex items-center gap-4">
            <p className="text-[11px] text-white/18">
              Haz clic en el eje temporal para ver quién estaba vivo ese año
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
