'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, X, ArrowUpRight } from 'lucide-react'
import { HistoricalFigure } from '@/types'
import { getCategoryColor } from '@/lib/timelineUtils'
import { figureSlug } from '@/lib/slug'
import { useTranslation } from '@/hooks/useLocale'
import { FigureDescription } from '@/components/UI/FigureName'

interface Props {
  figure: HistoricalFigure | null
  onClose: () => void
  onAdd?: (fig: HistoricalFigure) => void
}

export default function PersonCard({ figure, onClose, onAdd }: Props) {
  const { t, fy, fn, fc } = useTranslation()
  return (
    <AnimatePresence>
      {figure && (
        <motion.div
          key={figure.id}
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-2 rounded-2xl overflow-hidden w-72 shadow-2xl"
        >
          {/* Color header */}
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${getCategoryColor(figure.category)}, transparent)` }}
          />

          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3
                  className="font-display text-lg leading-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.92)' }}
                >
                  {fn(figure)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: `${getCategoryColor(figure.category)}22`,
                      color: getCategoryColor(figure.category),
                    }}
                  >
                    {fc(figure.category)}
                  </span>
                  <span className="text-white/35 text-[11px]">{figure.country}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/25 hover:text-white/60 transition-colors mt-0.5 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Years */}
            <div
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg mb-3"
              style={{ background: `${getCategoryColor(figure.category)}12` }}
            >
              <div className="text-center">
                <div
                  className="text-xs font-mono font-medium"
                  style={{ color: getCategoryColor(figure.category) }}
                >
                  {fy(figure.birthYear)}
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">{t('person.birth')}</div>
              </div>
              <div className="flex-1 h-px" style={{ background: `${getCategoryColor(figure.category)}40` }} />
              <div
                className="text-xs font-mono font-medium"
                style={{ color: getCategoryColor(figure.category), opacity: 0.7 }}
              >
                {figure.deathYear - figure.birthYear} {t('person.ageAt')}
              </div>
              <div className="flex-1 h-px" style={{ background: `${getCategoryColor(figure.category)}40` }} />
              <div className="text-center">
                <div className="text-xs font-mono text-white/40">
                  {fy(figure.deathYear)}
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">{t('person.death')}</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-3">
              <FigureDescription figure={figure} />
            </p>

            {/* Tags */}
            {figure.tags && figure.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {figure.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/35"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {onAdd && (
                <button
                  onClick={() => onAdd(figure)}
                  className="flex-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
                  style={{
                    background: `${getCategoryColor(figure.category)}22`,
                    color: getCategoryColor(figure.category),
                    border: `1px solid ${getCategoryColor(figure.category)}33`,
                  }}
                >
                  {t('person.add')}
                </button>
              )}
              <Link
                href={`/personaje/${figureSlug(figure)}`}
                className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg bg-white/5 text-white/45 hover:bg-white/10 hover:text-white/80 transition-colors"
              >
                <ArrowUpRight size={11} />
                {t('person.profile')}
              </Link>
              <a
                href={figure.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg bg-white/5 text-white/40 hover:text-white/70 transition-colors"
              >
                <ExternalLink size={11} />
                {t('person.wiki')}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
