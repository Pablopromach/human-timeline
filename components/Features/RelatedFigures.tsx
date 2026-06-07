'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Plus } from 'lucide-react'
import { HistoricalFigure } from '@/types'
import { getCategoryColor } from '@/lib/timelineUtils'

interface Props {
  figures: HistoricalFigure[]
  sourceName: string
  onAdd: (fig: HistoricalFigure) => void
}

export default function RelatedFigures({ figures, sourceName, onAdd }: Props) {
  return (
    <AnimatePresence>
      {figures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="glass rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles size={11} className="text-amber-400" />
            <span className="text-[10px] font-mono text-white/35 tracking-wider uppercase">
              Relacionados con {sourceName.split(' ')[0]}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {figures.map(fig => {
              const color = getCategoryColor(fig.category)
              return (
                <motion.button
                  key={fig.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAdd(fig)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: `${color}15`,
                    color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Plus size={10} />
                  {fig.name.split(' ')[0]}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
