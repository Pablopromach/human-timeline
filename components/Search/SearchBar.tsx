'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { HistoricalFigure } from '@/types'
import { searchFigures } from '@/lib/searchEngine'
import { getCategoryColor } from '@/lib/timelineUtils'
import { useTranslation } from '@/hooks/useLocale'

interface Props {
  allFigures: HistoricalFigure[]
  selectedIds: number[]
  onAdd: (fig: HistoricalFigure) => void
}

export default function SearchBar({ allFigures, selectedIds, onAdd }: Props) {
  const { t, fy } = useTranslation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const results = searchFigures(query, allFigures, 8)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative w-full max-w-xl">
      {/* Input */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3.5 text-white/30 pointer-events-none"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={t('home.searchPlaceholder')}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all duration-200 font-body"
          style={{ fontFamily: 'var(--font-body)' }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full z-50 rounded-xl overflow-hidden glass-2 shadow-2xl border border-white/10"
          >
            {results.map((r, i) => {
              const isAdded = selectedIds.includes(r.figure.id)
              const color = getCategoryColor(r.figure.category)
              return (
                <motion.button
                  key={r.figure.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => {
                    onAdd(r.figure)
                    setQuery('')
                    setOpen(false)
                  }}
                  disabled={isAdded}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0 ${
                    isAdded
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-white/6 cursor-pointer'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/85 truncate">
                      {r.figure.name}
                    </div>
                    <div className="text-xs text-white/35 font-mono mt-0.5">
                      {fy(r.figure.birthYear)}
                      {' — '}
                      {fy(r.figure.deathYear)}
                      {' · '}
                      {r.figure.country}
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                    style={{ background: `${color}22`, color }}
                  >
                    {r.figure.category}
                  </span>
                  {isAdded && (
                    <span className="text-xs text-white/30 flex-shrink-0">{t('home.search.added')}</span>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
