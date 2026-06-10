'use client'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Share2, RotateCcw, Infinity as InfinityIcon, ListChecks, Heart } from 'lucide-react'
import { HistoricalFigure } from '@/types'
import figuresData from '@/data/figures.json'
import { searchFigures } from '@/lib/searchEngine'
import { getCategoryColor, formatYear } from '@/lib/timelineUtils'
import {
  getRandomTargetYear,
  scoreAnswer,
  getScoreRating,
  TOTAL_ROUNDS,
  ScoreResult,
} from '@/lib/game'
import HumanTimelineIcon from '@/components/UI/HumanTimelineIcon'

const allFigures = figuresData as HistoricalFigure[]
const MAX_MISSES = 3

type Phase = 'intro' | 'playing' | 'reveal' | 'finished'
type Mode = 'classic' | 'infinite'

interface RoundResult {
  year: number
  figure: HistoricalFigure
  result: ScoreResult
}

export default function RetoGame() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('classic')
  const [round, setRound] = useState(1)
  const [targetYear, setTargetYear] = useState(0)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [history, setHistory] = useState<RoundResult[]>([])
  const [query, setQuery] = useState('')
  const [lastResult, setLastResult] = useState<RoundResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const usedYears = useMemo(() => history.map(h => h.year), [history])
  const usedFigureIds = useMemo(() => new Set(history.map(h => h.figure.id)), [history])

  const results = useMemo(
    () => searchFigures(query, allFigures, 8).filter(r => !usedFigureIds.has(r.figure.id)),
    [query, usedFigureIds]
  )

  const startGame = useCallback((selectedMode: Mode) => {
    setMode(selectedMode)
    setPhase('playing')
    setRound(1)
    setScore(0)
    setMisses(0)
    setHistory([])
    setLastResult(null)
    setQuery('')
    setTargetYear(getRandomTargetYear())
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handlePick = useCallback((fig: HistoricalFigure) => {
    if (phase !== 'playing') return
    const result = scoreAnswer(fig, targetYear)
    const roundResult: RoundResult = { year: targetYear, figure: fig, result }
    setLastResult(roundResult)
    setHistory(h => [...h, roundResult])
    setScore(s => s + result.points)
    if (result.status !== 'perfect') setMisses(m => m + 1)
    setPhase('reveal')
    setQuery('')
  }, [phase, targetYear])

  const nextRound = useCallback(() => {
    const isClassicEnd = mode === 'classic' && round >= TOTAL_ROUNDS
    const isInfiniteEnd = mode === 'infinite' && misses >= MAX_MISSES
    if (isClassicEnd || isInfiniteEnd) {
      setPhase('finished')
      return
    }
    setRound(r => r + 1)
    setTargetYear(getRandomTargetYear(usedYears))
    setLastResult(null)
    setPhase('playing')
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [mode, round, misses, usedYears])

  const restart = useCallback(() => startGame(mode), [startGame, mode])

  const goToResult = useCallback(() => {
    const modeSlug = mode === 'classic' ? 'clasico' : 'infinito'
    const url = `/reto/r/${modeSlug}-${score}?rounds=${history.length}`
    router.push(url)
  }, [mode, score, history.length, router])

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl w-full text-center"
          >
            <div
              className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase mb-6"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              · Reto Histórico ·
            </div>
            <h1
              className="text-5xl md:text-6xl mb-6 leading-[0.95] tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.94)', fontStyle: 'italic' }}
            >
              ¿Quién vivió<br />en este año?
            </h1>
            <p className="text-white/55 text-base mb-10 leading-relaxed max-w-md mx-auto">
              Te damos un año al azar. Tú buscas un personaje histórico que viviera entonces.
              Cuanto más cerca, más puntos.
            </p>

            {/* Mode selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('classic')}
                className="glass-2 rounded-2xl p-6 text-left transition-all hover:border-white/20 group"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    <ListChecks size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/90">Clásico</h3>
                </div>
                <p className="text-sm text-white/55 leading-snug mb-3">
                  10 rondas fijas. Suma todos los puntos que puedas y comparte tu marca.
                </p>
                <div className="text-[10px] font-mono text-indigo-400 tracking-wider">
                  10 RONDAS · MÁX 100 PTS →
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('infinite')}
                className="glass-2 rounded-2xl p-6 text-left transition-all hover:border-white/20 group"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                  >
                    <InfinityIcon size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/90">Infinito</h3>
                </div>
                <p className="text-sm text-white/55 leading-snug mb-3">
                  Sigue jugando hasta fallar 3 veces (años no vividos). ¿Cuánto aguantas?
                </p>
                <div className="text-[10px] font-mono text-amber-400 tracking-wider flex items-center gap-1">
                  3 FALLOS Y FUERA <Heart size={9} fill="currentColor" /> <Heart size={9} fill="currentColor" /> <Heart size={9} fill="currentColor" />
                </div>
              </motion.button>
            </div>

            {/* Scoring guide */}
            <div className="glass rounded-2xl p-5 text-left">
              <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
                Sistema de puntos
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">🟢 Vivía en el año</span>
                  <span className="font-mono text-emerald-400">+10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400">🟡 ≤ 25 años</span>
                  <span className="font-mono text-amber-400">+5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400/70">🟡 ≤ 75 años</span>
                  <span className="font-mono text-amber-400/70">+2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">⚪ ≤ 200 años</span>
                  <span className="font-mono text-white/50">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400">🟠 ≤ 500 años</span>
                  <span className="font-mono text-orange-400">−3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400">🔴 más de 500</span>
                  <span className="font-mono text-red-400">−6 / −10</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── FINISHED ──────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const rating = getScoreRating(score)
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--void)' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl w-full"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 14 }}
                className="text-7xl mb-4"
              >
                {rating.emoji}
              </motion.div>
              <h2
                className="text-4xl md:text-5xl mb-3 tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: rating.color, fontStyle: 'italic' }}
              >
                {rating.label}
              </h2>
              <div className="text-7xl font-bold font-mono" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {score}
                <span className="text-white/25 text-3xl">
                  {mode === 'classic' ? `/${TOTAL_ROUNDS * 10}` : ''}
                </span>
              </div>
              <div className="text-xs text-white/40 font-mono mt-2 uppercase tracking-widest">
                {mode === 'classic'
                  ? `Modo Clásico · ${history.length} rondas`
                  : `Modo Infinito · ${history.length} rondas · ${MAX_MISSES} fallos`}
              </div>
            </div>

            {/* History */}
            <div className="glass rounded-2xl p-5 mb-6">
              <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
                Tu recorrido
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <RoundRow key={i} index={i} round={h} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={goToResult}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                }}
              >
                <Share2 size={15} /> Compartir resultado
              </button>
              <button
                onClick={restart}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white/8 text-white/85 hover:bg-white/14 transition-all"
              >
                <RotateCcw size={15} /> Otra partida
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm bg-white/4 text-white/55 hover:text-white/85 transition-all"
              >
                Timeline
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── PLAYING / REVEAL ──────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--void)' }}>
      <Header />

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-white/40 tracking-wider">
              {mode === 'classic'
                ? <>RONDA {round} <span className="text-white/20">/</span> {TOTAL_ROUNDS}</>
                : <>RONDA {round} <span className="text-white/20">·</span> MODO INFINITO</>
              }
            </span>
            <div className="flex items-center gap-3">
              {mode === 'infinite' && (
                <span className="flex items-center gap-1">
                  {Array.from({ length: MAX_MISSES }).map((_, i) => (
                    <Heart
                      key={i}
                      size={13}
                      fill={i < MAX_MISSES - misses ? '#ef4444' : 'transparent'}
                      stroke={i < MAX_MISSES - misses ? '#ef4444' : 'rgba(255,255,255,0.18)'}
                    />
                  ))}
                </span>
              )}
              <span className="text-sm font-mono">
                <span className="text-white/30 mr-2">Puntos</span>
                <span className="font-semibold" style={{ color: score >= 0 ? '#10b981' : '#ef4444' }}>
                  {score >= 0 ? '+' : ''}{score}
                </span>
              </span>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: mode === 'classic'
                  ? `${(round / TOTAL_ROUNDS) * 100}%`
                  : `${((MAX_MISSES - misses) / MAX_MISSES) * 100}%`,
              }}
              transition={{ duration: 0.4 }}
              style={{
                background: mode === 'classic'
                  ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  : `linear-gradient(90deg, ${misses === 0 ? '#10b981' : misses === 1 ? '#f59e0b' : '#ef4444'}, ${misses < 2 ? '#fbbf24' : '#dc2626'})`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {phase === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-center mb-8">
                  <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
                    ¿Quién vivió en…
                  </div>
                  <motion.div
                    key={targetYear}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 160, damping: 14 }}
                    className="text-7xl md:text-8xl tracking-tight"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: 'linear-gradient(135deg, #a5b4fc 0%, #f9a8d4 50%, #fcd34d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {targetYear < 0 ? Math.abs(targetYear) : targetYear}
                  </motion.div>
                  <div className="text-base text-white/40 font-mono mt-1">
                    {targetYear < 0 ? 'a.C.' : 'd.C.'}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Escribe el nombre de un personaje histórico…"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl pl-12 pr-4 py-4 text-base text-white/90 placeholder-white/30 outline-none focus:border-indigo-400/50 focus:bg-white/8 transition-all"
                  />

                  <AnimatePresence>
                    {results.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-2 w-full z-30 glass-2 rounded-2xl overflow-hidden border border-white/12 shadow-2xl"
                      >
                        {results.map((r, i) => {
                          const color = getCategoryColor(r.figure.category)
                          return (
                            <motion.button
                              key={r.figure.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() => handlePick(r.figure)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/6 transition-colors border-b border-white/5 last:border-0"
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white/90 truncate">
                                  {r.figure.name}
                                </div>
                                <div className="text-[11px] text-white/40 mt-0.5 truncate">
                                  {r.figure.country}
                                </div>
                              </div>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                                style={{ background: `${color}22`, color }}
                              >
                                {r.figure.category}
                              </span>
                            </motion.button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-center mt-4 text-[11px] text-white/30">
                  {usedFigureIds.size > 0
                    ? `${usedFigureIds.size} personaje${usedFigureIds.size !== 1 ? 's' : ''} ya usado${usedFigureIds.size !== 1 ? 's' : ''} no puede${usedFigureIds.size === 1 ? '' : 'n'} repetirse`
                    : 'Pulsa sobre el personaje para responder'}
                </p>
              </motion.div>
            )}

            {phase === 'reveal' && lastResult && (
              <RevealCard
                key="reveal"
                round={lastResult}
                isLastRound={
                  (mode === 'classic' && round >= TOTAL_ROUNDS) ||
                  (mode === 'infinite' && misses >= MAX_MISSES)
                }
                onNext={nextRound}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="flex-shrink-0 border-b border-white/6 px-5 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
          >
            <HumanTimelineIcon size={20} className="text-white" />
          </div>
          <div>
            <div className="text-base font-semibold text-white/90 leading-none group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
              Human Timeline
            </div>
            <div className="text-[10px] text-white/30 font-mono mt-0.5 tracking-widest">RETO HISTÓRICO</div>
          </div>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/75 transition-colors"
        >
          <ArrowLeft size={13} /> Volver al timeline
        </Link>
      </div>
    </header>
  )
}

function RoundRow({ index, round }: { index: number; round: RoundResult }) {
  const color = getCategoryColor(round.figure.category)
  const points = round.result.points
  const statusColor =
    round.result.status === 'perfect' ? '#10b981' :
    round.result.status === 'close' ? '#f59e0b' :
    round.result.status === 'fair' ? '#94a3b8' :
    round.result.status === 'far' ? '#f97316' : '#ef4444'
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3"
    >
      <span className="text-[10px] font-mono text-white/30 w-6">#{index + 1}</span>
      <span className="font-mono text-xs text-white/55 w-16">
        {round.year < 0 ? Math.abs(round.year) + ' aC' : round.year}
      </span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="flex-1 text-sm text-white/80 truncate">{round.figure.name}</span>
      <span className="text-[11px] text-white/40 hidden sm:inline">{round.result.message}</span>
      <span
        className="font-mono font-semibold text-sm w-12 text-right"
        style={{ color: statusColor }}
      >
        {points >= 0 ? '+' : ''}{points}
      </span>
    </motion.div>
  )
}

function RevealCard({ round, isLastRound, onNext }: {
  round: RoundResult
  isLastRound: boolean
  onNext: () => void
}) {
  const color = getCategoryColor(round.figure.category)
  const points = round.result.points
  const statusColor =
    round.result.status === 'perfect' ? '#10b981' :
    round.result.status === 'close' ? '#f59e0b' :
    round.result.status === 'fair' ? '#94a3b8' :
    round.result.status === 'far' ? '#f97316' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
        className="text-7xl font-bold mb-2 font-mono"
        style={{ color: statusColor }}
      >
        {points >= 0 ? '+' : ''}{points}
      </motion.div>
      <div className="text-sm text-white/60 mb-8">{round.result.message}</div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-2 rounded-2xl p-6 mb-6 text-left"
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-3 h-12 rounded-full flex-shrink-0 mt-1"
            style={{ background: color, boxShadow: `0 0 12px ${color}88` }}
          />
          <div className="flex-1">
            <h3
              className="text-2xl mb-1 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.95)' }}
            >
              {round.figure.name}
            </h3>
            <div className="text-xs text-white/40 font-mono">
              {formatYear(round.figure.birthYear)} → {formatYear(round.figure.deathYear)}
              <span className="mx-2 text-white/20">|</span>
              {round.figure.country} · {round.figure.category}
            </div>
          </div>
        </div>

        <YearDistanceBar
          targetYear={round.year}
          birthYear={round.figure.birthYear}
          deathYear={round.figure.deathYear}
          color={color}
        />

        <p className="text-sm text-white/55 mt-4 leading-relaxed">
          {round.figure.description}
        </p>
      </motion.div>

      <button
        onClick={onNext}
        className="px-8 py-3 rounded-xl text-base font-semibold transition-all"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
        }}
      >
        {isLastRound ? 'Ver resultados →' : 'Siguiente ronda →'}
      </button>
    </motion.div>
  )
}

function YearDistanceBar({ targetYear, birthYear, deathYear, color }: {
  targetYear: number
  birthYear: number
  deathYear: number
  color: string
}) {
  const minY = Math.min(targetYear, birthYear) - 100
  const maxY = Math.max(targetYear, deathYear) + 100
  const range = maxY - minY
  const lifeStart = ((birthYear - minY) / range) * 100
  const lifeWidth = ((deathYear - birthYear) / range) * 100
  const targetPos = ((targetYear - minY) / range) * 100

  return (
    <div className="relative h-12">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-white/5" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full"
        style={{ left: `${lifeStart}%`, width: `${lifeWidth}%`, background: color, boxShadow: `0 0 8px ${color}66` }}
      />
      <div className="absolute -bottom-1 text-[9px] font-mono text-white/40 transform -translate-x-1/2" style={{ left: `${lifeStart}%` }}>
        {birthYear < 0 ? Math.abs(birthYear) + 'aC' : birthYear}
      </div>
      <div className="absolute -bottom-1 text-[9px] font-mono text-white/40 transform -translate-x-1/2" style={{ left: `${lifeStart + lifeWidth}%` }}>
        {deathYear < 0 ? Math.abs(deathYear) + 'aC' : deathYear}
      </div>
      <div className="absolute top-0 -translate-x-1/2" style={{ left: `${targetPos}%` }}>
        <div className="w-0.5 h-12 bg-amber-400" style={{ boxShadow: '0 0 6px #f59e0b' }} />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold text-amber-400 whitespace-nowrap">
          {targetYear < 0 ? Math.abs(targetYear) + ' aC' : targetYear}
        </div>
      </div>
    </div>
  )
}
