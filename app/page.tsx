'use client'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Shuffle, Trash2, ChevronDown, Crown, Gamepad2 } from 'lucide-react'
import HumanTimelineIcon from '@/components/UI/HumanTimelineIcon'
import LanguageSwitcher from '@/components/UI/LanguageSwitcher'
import MobileRedirect from '@/components/MobileRedirect'
import { useTimeline } from '@/hooks/useTimeline'
import { useTranslation } from '@/hooks/useLocale'
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
  const { t, locale } = useTranslation()
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
    clearAll,
    setHoveredFigure,
    setActiveYear,
    setCategoryFilter,
  } = useTimeline()

  const [selectedCard, setSelectedCard] = useState<HistoricalFigure | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [showCivilizations, setShowCivilizations] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const civilizations = civilizationsData as Civilization[]

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
    setMobileSidebarOpen(true)
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

  const sidebarHasContent = selectedCard || coexistences.length > 0 || relatedFigures.length > 0 || activeYear !== null

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--void)' }}>
      <MobileRedirect />
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/6 px-3 sm:px-5 py-3">
        <div className="max-w-screen-2xl mx-auto">
          {/* Mobile: top row with logo + actions */}
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
                >
                  <HumanTimelineIcon size={20} className="text-white" />
                </div>
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                  style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
                />
              </div>
              <div>
                <h1
                  className="text-sm sm:text-base font-semibold tracking-tight leading-none"
                  style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.9)' }}
                >
                  Human Timeline
                </h1>
                <p className="text-[9px] sm:text-[10px] text-white/30 font-mono mt-0.5 tracking-widest">
                  {t('home.tagline')}
                </p>
              </div>
            </div>

            {/* Desktop search (inline) */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <SearchBar
                allFigures={allFigures}
                selectedIds={allSelected.map(f => f.id)}
                onAdd={handleAdd}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/reto"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.18))',
                  color: '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.35)',
                }}
              >
                <Gamepad2 size={13} />
                <span className="hidden xs:inline sm:inline">{t('home.playGame')}</span>
              </Link>
              <button
                onClick={() => setShowCivilizations(v => !v)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: showCivilizations ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)',
                  color: showCivilizations ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                  border: showCivilizations ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
                }}
              >
                <Crown size={13} />
                {t('home.civilizations')}
              </button>
              <button
                onClick={handleRandom}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all"
              >
                <Shuffle size={13} />
                {t('home.random')}
              </button>
              {allSelected.length > 0 && (
                <button
                  onClick={clearAll}
                  aria-label={t('home.clear')}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400/80 hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">{t('home.clear')}</span>
                </button>
              )}
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile search (second row) */}
          <div className="md:hidden">
            <SearchBar
              allFigures={allFigures}
              selectedIds={allSelected.map(f => f.id)}
              onAdd={handleAdd}
            />
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
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-4"
            style={{ top: 73 }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center pointer-events-auto max-w-2xl"
            >
              <h2
                className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-none tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(255,255,255,0.88)',
                  fontStyle: 'italic',
                }}
              >
                {t('home.intro.headline1')}<br />{t('home.intro.headline2')}
              </h2>
              <p className="text-white/45 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-2">
                {t('home.intro.subtitle')}
              </p>

              <div className="flex flex-wrap gap-2 justify-center mb-5 sm:mb-6 px-2">
                {['Julio César', 'Napoleón Bonaparte', 'Albert Einstein', 'Cleopatra VII', 'Leonardo da Vinci'].map(name => {
                  const fig = allFigures.find(f => f.name === name)
                  if (!fig) return null
                  return (
                    <motion.button
                      key={name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAdd(fig)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm glass border border-white/10 text-white/65 hover:text-white/90 hover:border-white/20 transition-all"
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
                {t('home.intro.randomBtn')}
              </button>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 sm:bottom-8 text-white/20"
            >
              <ChevronDown size={20} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Timeline area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {allSelected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-b border-white/5 px-3 sm:px-5 py-2 sm:py-2.5 flex flex-wrap items-center gap-2 sm:gap-4"
            >
              <CategoryFilter
                active={categoryFilter}
                onChange={setCategoryFilter}
                counts={categoryCounts}
              />
              <span className="text-[11px] text-white/40 font-mono ml-auto hidden md:inline">
                <span className="text-white/70 font-semibold">{selectedFigures.length}</span>
                {' '}{selectedFigures.length === 1 ? t('common.figure') : t('common.figures')}
                <span className="mx-3 text-white/15">|</span>
                <span className="text-white/40">{t('home.instructions')}</span>
              </span>
              <span className="text-[11px] text-white/40 font-mono md:hidden">
                <span className="text-white/70 font-semibold">{selectedFigures.length}</span>{' '}
                {selectedFigures.length === 1 ? t('common.figure') : t('common.figures')}
              </span>
            </motion.div>
          )}

          {/* Chart */}
          <div className="flex-1 min-h-0 overflow-auto">
            <TimelineChart
              figures={selectedFigures}
              civilizations={showCivilizations ? civilizations : []}
              onHover={setHoveredFigure}
              onYearClick={year => { setActiveYear(year); setShowIntro(false); setMobileSidebarOpen(true) }}
              onSelectFigure={handleSelectFigure}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <AnimatePresence>
          {sidebarHasContent && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block flex-shrink-0 border-l border-white/6 overflow-y-auto overflow-x-hidden"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              <div className="p-4 space-y-4 min-w-[300px]">
                <PersonCard
                  figure={selectedCard}
                  onClose={() => setSelectedCard(null)}
                  onAdd={fig => { addFigure(fig); setSelectedCard(null) }}
                />
                <WhoWasAlive
                  year={activeYear}
                  figures={aliveInYear}
                  selectedIds={allSelected.map(f => f.id)}
                  onAdd={handleAdd}
                  onClose={() => setActiveYear(null)}
                />
                <CoexistenceTooltip coexistences={coexistences} />
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

        {/* Mobile bottom sheet */}
        <AnimatePresence>
          {sidebarHasContent && mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setMobileSidebarOpen(false); setSelectedCard(null); setActiveYear(null) }}
                className="md:hidden fixed inset-0 bg-black/50 z-40"
              />
              <motion.aside
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-white/10 max-h-[75vh] overflow-y-auto"
                style={{ background: '#0d0d18' }}
              >
                <div className="sticky top-0 flex justify-center pt-2 pb-1" style={{ background: '#0d0d18' }}>
                  <div className="w-12 h-1 rounded-full bg-white/15" />
                </div>
                <div className="p-4 pt-2 space-y-4">
                  <PersonCard
                    figure={selectedCard}
                    onClose={() => { setSelectedCard(null); setMobileSidebarOpen(false) }}
                    onAdd={fig => { addFigure(fig); setSelectedCard(null); setMobileSidebarOpen(false) }}
                  />
                  <WhoWasAlive
                    year={activeYear}
                    figures={aliveInYear}
                    selectedIds={allSelected.map(f => f.id)}
                    onAdd={handleAdd}
                    onClose={() => { setActiveYear(null); setMobileSidebarOpen(false) }}
                  />
                  <CoexistenceTooltip coexistences={coexistences} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
