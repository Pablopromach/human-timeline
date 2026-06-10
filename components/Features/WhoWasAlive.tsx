'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Plus } from 'lucide-react'
import { HistoricalFigure } from '@/types'
import { getCategoryColor } from '@/lib/timelineUtils'
import { useTranslation } from '@/hooks/useLocale'

interface Props {
  year: number | null
  figures: HistoricalFigure[]
  selectedIds: number[]
  onAdd: (fig: HistoricalFigure) => void
  onClose: () => void
}

export default function WhoWasAlive({ year, figures, selectedIds, onAdd, onClose }: Props) {
  const { t, fy, locale } = useTranslation()
  const bcSuffix = locale === 'es' ? 'aC' : 'BC'
  return (
    <AnimatePresence>
      {year !== null && figures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-2 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-indigo-400" />
              <span className="text-xs font-medium text-white/70">
                {t('whoAlive.title')}{' '}
                <span className="text-indigo-400 font-mono">{fy(year)}</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-mono">
                {figures.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white/25 hover:text-white/60 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {figures.map((fig, i) => {
              const isAdded = selectedIds.includes(fig.id)
              const color = getCategoryColor(fig.category)
              return (
                <motion.div
                  key={fig.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white/75 truncate">{fig.name}</div>
                    <div className="text-[10px] text-white/30 font-mono">
                      {Math.abs(fig.birthYear)}{fig.birthYear < 0 ? bcSuffix : ''} – {fig.deathYear < 0 ? `${Math.abs(fig.deathYear)}${bcSuffix}` : fig.deathYear}
                    </div>
                  </div>
                  {!isAdded && (
                    <button
                      onClick={() => onAdd(fig)}
                      className="text-white/20 hover:text-white/70 transition-colors flex-shrink-0"
                    >
                      <Plus size={13} />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
