'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CoexistenceInfo } from '@/types'
import { useTranslation } from '@/hooks/useLocale'

interface Props {
  coexistences: CoexistenceInfo[]
}

export default function CoexistenceTooltip({ coexistences }: Props) {
  const { t, fy } = useTranslation()
  return (
    <AnimatePresence>
      {coexistences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="glass-2 rounded-xl p-4 space-y-2"
        >
          <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
            {t('coexist.title')}
          </div>
          {coexistences.map((cx, i) => (
            <motion.div
              key={`${cx.person1.id}-${cx.person2.id}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-emerald-400 text-xs">✦</span>
              <p className="text-xs text-white/65 leading-snug">
                <span dangerouslySetInnerHTML={{
                  __html: t('coexist.message', { a: `<strong class="text-white/85 font-medium">${cx.person1.name}</strong>`, b: `<strong class="text-white/85 font-medium">${cx.person2.name}</strong>`, n: cx.years })
                    .replace(/<strong/g, '<strong')
                }} />
                <span className="text-white/30 text-[10px] ml-1">
                  ({fy(cx.overlapStart)} – {fy(cx.overlapEnd)})
                </span>
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
