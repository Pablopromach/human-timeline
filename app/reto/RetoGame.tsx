'use client'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, Share2, RotateCcw, Infinity as InfinityIcon, ListChecks, Heart, Check, Link as LinkIcon, Dice5, Swords } from 'lucide-react'
import { HistoricalFigure } from '@/types'
import figuresData from '@/data/figures.json'
import { searchFigures } from '@/lib/searchEngine'
import { getCategoryColor } from '@/lib/timelineUtils'
import {
  getRandomTargetYear,
  scoreAnswer,
  getScoreRating,
  TOTAL_ROUNDS,
  ScoreResult,
} from '@/lib/game'
import HumanTimelineIcon from '@/components/UI/HumanTimelineIcon'
import LanguageSwitcher from '@/components/UI/LanguageSwitcher'
import { useTranslation } from '@/hooks/useLocale'
import { Locale } from '@/lib/i18n'

const allFigures = figuresData as HistoricalFigure[]
const MAX_MISSES = 3

type Phase = 'intro' | 'playing' | 'reveal' | 'finished'
type Mode = 'classic' | 'infinite'

interface RoundResult {
  year: number
  figure: HistoricalFigure
  result: ScoreResult
}

function getRatingTranslated(score: number, t: (k: string) => string) {
  const r = getScoreRating(score)
  const pct = (score / (TOTAL_ROUNDS * 10)) * 100
  let labelKey = 'rating.review'
  if (pct >= 90) labelKey = 'rating.master'
  else if (pct >= 75) labelKey = 'rating.brilliant'
  else if (pct >= 55) labelKey = 'rating.advanced'
  else if (pct >= 35) labelKey = 'rating.curious'
  else if (pct >= 15) labelKey = 'rating.traveler'
  return { ...r, label: t(labelKey) }
}

function getRevealMessage(result: ScoreResult, t: (k: string, v?: Record<string, string | number>) => string): string {
  const n = result.distance
  switch (result.status) {
    case 'perfect': return t('reveal.alive')
    case 'close':
      if (result.points === 5) return t('reveal.veryClose', { n })
      return t('reveal.closeDist', { n })
    case 'fair': return t('reveal.medDist', { n })
    case 'far':
      if (result.points === -3) return t('reveal.farDist', { n })
      return t('reveal.veryFarDist', { n })
    case 'wrong': return t('reveal.wrongEra', { n })
  }
}

export default function RetoGame() {
  const { t, fy, locale, fn, fc } = useTranslation()
  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('classic')
  const [round, setRound] = useState(1)
  const [targetYear, setTargetYear] = useState(0)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [history, setHistory] = useState<RoundResult[]>([])
  const [query, setQuery] = useState('')
  const [lastResult, setLastResult] = useState<RoundResult | null>(null)
  const [shareToast, setShareToast] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [hasUsedRefresh, setHasUsedRefresh] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const usedYears = useMemo(() => history.map(h => h.year), [history])
  const usedFigureIds = useMemo(() => new Set(history.map(h => h.figure.id)), [history])

  const results = useMemo(
    () => searchFigures(query, allFigures, 50).filter(r => !usedFigureIds.has(r.figure.id)),
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
    setHasUsedRefresh(false)
    setTargetYear(getRandomTargetYear())
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleRefreshYear = useCallback(() => {
    if (phase !== 'playing' || mode !== 'infinite' || hasUsedRefresh) return
    setHasUsedRefresh(true)
    setTargetYear(getRandomTargetYear([...usedYears, targetYear]))
  }, [phase, mode, hasUsedRefresh, usedYears, targetYear])

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
    // hasUsedRefresh is NOT reset here — comodín is 1 per entire game,
    // not 1 per round. It only resets on startGame().
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [mode, round, misses, usedYears])

  const restart = useCallback(() => startGame(mode), [startGame, mode])

  // Build the shareable result URL — kept for "view shared page" link
  const resultUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const modeSlug = mode === 'classic' ? 'clasico' : 'infinito'
    return `${window.location.origin}/reto/r/${modeSlug}-${score}?rounds=${history.length}`
  }, [mode, score, history.length])

  // Trigger native share (or fallback to clipboard) — directly from finished screen
  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const url = resultUrl
    const text = mode === 'classic'
      ? t('game.shareText.classic', { score })
      : t('game.shareText.infinite', { score })

    // 1. Try Web Share API (native sheet on iOS/Android)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Human Timeline', text, url })
        return // user shared or completed share
      } catch (err: any) {
        // user cancelled → do nothing, don't fall through to clipboard
        if (err?.name === 'AbortError') return
        // any other error → fall through
      }
    }

    // 2. Try modern clipboard
    const fullText = `${text}\n${url}`
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText)
      } else {
        const ta = document.createElement('textarea')
        ta.value = fullText
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setShareCopied(true)
      setShareToast(t('common.copied'))
      setTimeout(() => { setShareCopied(false); setShareToast(null) }, 2200)
    } catch {
      window.prompt(t('result.shareLink'), fullText)
    }
  }, [resultUrl, mode, score, t])

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--void)' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl w-full text-center"
          >
            <div
              className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono tracking-widest uppercase mb-4 sm:mb-6"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              {t('game.tag')}
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 leading-[0.95] tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.94)', fontStyle: 'italic' }}
            >
              {t('game.title1')}<br />{t('game.title2')}
            </h1>
            <p className="text-white/55 text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed max-w-md mx-auto px-2">
              {t('game.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 sm:mb-8">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('classic')}
                className="glass-2 rounded-2xl p-5 sm:p-6 text-left transition-all hover:border-white/20"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    <ListChecks size={18} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/90">{t('game.mode.classic')}</h3>
                </div>
                <p className="text-xs sm:text-sm text-white/55 leading-snug mb-3">
                  {t('game.mode.classicDesc')}
                </p>
                <div className="text-[10px] font-mono text-indigo-400 tracking-wider">
                  {t('game.mode.classicBadge')}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('infinite')}
                className="glass-2 rounded-2xl p-5 sm:p-6 text-left transition-all hover:border-white/20"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                  >
                    <InfinityIcon size={18} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/90">{t('game.mode.infinite')}</h3>
                </div>
                <p className="text-xs sm:text-sm text-white/55 leading-snug mb-3">
                  {t('game.mode.infiniteDesc')}
                </p>
                <div className="text-[10px] font-mono text-amber-400 tracking-wider flex items-center gap-1">
                  {t('game.mode.infiniteBadge')} <Heart size={9} fill="currentColor" /> <Heart size={9} fill="currentColor" /> <Heart size={9} fill="currentColor" />
                </div>
              </motion.button>

              <motion.a
                href="/reto/multi"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="glass-2 rounded-2xl p-5 sm:p-6 text-left transition-all hover:border-white/20 block"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                  >
                    <Swords size={18} className="text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white/90">1 vs 1</h3>
                </div>
                <p className="text-xs sm:text-sm text-white/55 leading-snug mb-3">
                  Enfrenta a un amigo. Mismo año, respuesta simultánea. Gana quien aguante más vidas.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 tracking-wider">
                  MODO MULTIJUGADOR →
                </div>
              </motion.a>
            </div>

            <div className="glass rounded-2xl p-4 sm:p-5 text-left">
              <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
                {t('game.scoring.title')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">🟢 {t('game.scoring.alive')}</span>
                  <span className="font-mono text-emerald-400">+10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400">🟡 {t('game.scoring.veryClose')}</span>
                  <span className="font-mono text-amber-400">+5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400/70">🟡 {t('game.scoring.close')}</span>
                  <span className="font-mono text-amber-400/70">+2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">⚪ {t('game.scoring.medium')}</span>
                  <span className="font-mono text-white/50">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400">🟠 {t('game.scoring.far')}</span>
                  <span className="font-mono text-orange-400">−3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400">🔴 {t('game.scoring.wrong')}</span>
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
    const rating = getRatingTranslated(score, t)
    return (
      <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--void)' }}>
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl w-full"
          >
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 14 }}
                className="text-6xl sm:text-7xl mb-3 sm:mb-4"
              >
                {rating.emoji}
              </motion.div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: rating.color, fontStyle: 'italic' }}
              >
                {rating.label}
              </h2>
              <div className="text-6xl sm:text-7xl font-bold font-mono" style={{ color: 'rgba(255,255,255,0.92)' }}>
                {score}
                <span className="text-white/25 text-2xl sm:text-3xl">
                  {mode === 'classic' ? `/${TOTAL_ROUNDS * 10}` : ''}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-white/40 font-mono mt-2 uppercase tracking-widest">
                {mode === 'classic'
                  ? `${t('game.modeClassic')} · ${history.length} ${t('game.rounds')}`
                  : `${t('game.modeInfinite')} · ${history.length} ${t('game.rounds')} · ${MAX_MISSES} ${t('game.misses')}`}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 sm:p-5 mb-6">
              <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">
                {t('game.journey')}
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <RoundRow key={i} index={i} round={h} t={t} fy={fy} locale={locale} fn={fn} />
                ))}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                }}
              >
                {shareCopied ? <><Check size={15} /> {t('common.copied')}</> : <><Share2 size={15} /> {t('game.shareResult')}</>}
              </button>
              <button
                onClick={restart}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-sm font-semibold bg-white/8 text-white/85 hover:bg-white/14 transition-all"
              >
                <RotateCcw size={15} /> {t('game.playAgain')}
              </button>
              <Link
                href={`/reto/r/${mode === 'classic' ? 'clasico' : 'infinito'}-${score}?rounds=${history.length}`}
                className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-sm bg-white/4 text-white/55 hover:text-white/85 transition-all"
              >
                <LinkIcon size={13} /> {t('result.shareLink')}
              </Link>
            </div>

            {/* Toast */}
            <AnimatePresence>
              {shareToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-2 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm text-white/90"
                >
                  <Check size={14} className="text-emerald-400" />
                  {shareToast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── PLAYING / REVEAL ──────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--void)' }}>
      <Header />

      {/* Progress bar */}
      <div className="px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2 gap-3">
            <span className="text-[10px] sm:text-[11px] font-mono text-white/40 tracking-wider">
              {mode === 'classic'
                ? <>{t('game.round')} {round} <span className="text-white/20">/</span> {TOTAL_ROUNDS}</>
                : <>{t('game.round')} {round} <span className="text-white/20 mx-1">·</span> {t('game.round.infinite')}</>
              }
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
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
              <span className="text-xs sm:text-sm font-mono">
                <span className="text-white/30 mr-1.5 sm:mr-2 hidden xs:inline">{t('game.points')}</span>
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

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {phase === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <div className="text-[10px] sm:text-[11px] font-mono text-white/30 tracking-widest uppercase mb-2 sm:mb-3">
                    {t('game.questionLabel')}
                  </div>
                  <motion.div
                    key={targetYear}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 160, damping: 14 }}
                    className="text-6xl sm:text-7xl md:text-8xl tracking-tight leading-none"
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
                  <div className="text-sm sm:text-base text-white/40 font-mono mt-1">
                    {targetYear < 0 ? t('common.bc') : t('common.ad')}
                  </div>

                  {/* Refresh year — only in infinite mode, once per round */}
                  {mode === 'infinite' && (
                    <motion.button
                      key={`${round}-${hasUsedRefresh}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleRefreshYear}
                      disabled={hasUsedRefresh}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all"
                      style={{
                        background: hasUsedRefresh ? 'rgba(255,255,255,0.04)' : 'rgba(245,158,11,0.15)',
                        color: hasUsedRefresh ? 'rgba(255,255,255,0.25)' : '#f59e0b',
                        border: `1px solid ${hasUsedRefresh ? 'rgba(255,255,255,0.06)' : 'rgba(245,158,11,0.4)'}`,
                        cursor: hasUsedRefresh ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Dice5 size={11} />
                      {hasUsedRefresh ? t('game.refresh.used') : t('game.refresh.label')}
                    </motion.button>
                  )}
                </div>

                <div className="relative">
                  <Search size={18} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('game.searchPlaceholder')}
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 text-sm sm:text-base text-white/90 placeholder-white/30 outline-none focus:border-indigo-400/50 focus:bg-white/8 transition-all"
                  />

                  <AnimatePresence>
                    {results.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-2 w-full z-30 glass-2 rounded-2xl overflow-y-auto border border-white/12 shadow-2xl"
                        style={{ maxHeight: '60vh' }}
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
                              className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-left hover:bg-white/6 active:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white/90 truncate">
                                  {fn(r.figure)}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-white/40 mt-0.5 truncate">
                                  {r.figure.country}
                                </div>
                              </div>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium flex-shrink-0"
                                style={{ background: `${color}22`, color }}
                              >
                                {fc(r.figure.category)}
                              </span>
                            </motion.button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-center mt-3 sm:mt-4 text-[10px] sm:text-[11px] text-white/30 px-2">
                  {usedFigureIds.size > 0
                    ? t('game.usedHint', { n: usedFigureIds.size })
                    : t('game.tapHint')}
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
                t={t}
                fy={fy}
                fn={fn}
                fc={fc}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Header() {
  const { t } = useTranslation()
  return (
    <header className="flex-shrink-0 border-b border-white/6 px-3 sm:px-5 py-2.5 sm:py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
          >
            <HumanTimelineIcon size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-semibold text-white/90 leading-none group-hover:text-white transition-colors truncate" style={{ fontFamily: 'var(--font-display)' }}>
              Human Timeline
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/30 font-mono mt-0.5 tracking-widest">
              {t('game.subtitle.header')}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/?desktop=1"
            className="hidden sm:flex items-center gap-1.5 text-[11px] sm:text-xs text-white/40 hover:text-white/75 transition-colors"
          >
            <ArrowLeft size={13} />
            {t('common.back')}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

function RoundRow({ index, round, t, fy, locale, fn }: {
  index: number
  round: RoundResult
  t: (k: string, v?: Record<string, string | number>) => string
  fy: (y: number) => string
  locale: Locale
  fn: (f: import('@/types').HistoricalFigure) => string
}) {
  const color = getCategoryColor(round.figure.category)
  const points = round.result.points
  const statusColor =
    round.result.status === 'perfect' ? '#10b981' :
    round.result.status === 'close' ? '#f59e0b' :
    round.result.status === 'fair' ? '#94a3b8' :
    round.result.status === 'far' ? '#f97316' : '#ef4444'
  const bcSuffix = locale === 'es' ? 'aC' : 'BC'
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-2 sm:gap-3 py-2 px-1 sm:px-2 rounded-lg hover:bg-white/3"
    >
      <span className="text-[10px] font-mono text-white/30 w-5 sm:w-6 flex-shrink-0">#{index + 1}</span>
      <span className="font-mono text-[11px] sm:text-xs text-white/55 w-12 sm:w-16 flex-shrink-0">
        {round.year < 0 ? Math.abs(round.year) + bcSuffix : round.year}
      </span>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="flex-1 text-xs sm:text-sm text-white/80 truncate">{fn(round.figure)}</span>
      <span className="text-[10px] sm:text-[11px] text-white/40 hidden md:inline truncate max-w-[140px]">
        {getRevealMessage(round.result, t)}
      </span>
      <span
        className="font-mono font-semibold text-xs sm:text-sm w-9 sm:w-12 text-right flex-shrink-0"
        style={{ color: statusColor }}
      >
        {points >= 0 ? '+' : ''}{points}
      </span>
    </motion.div>
  )
}

function RevealCard({ round, isLastRound, onNext, t, fy, fn, fc }: {
  round: RoundResult
  isLastRound: boolean
  onNext: () => void
  t: (k: string, v?: Record<string, string | number>) => string
  fy: (y: number) => string
  fn: (f: import('@/types').HistoricalFigure) => string
  fc: (cat: string) => string
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
      transition={{ duration: 0.35 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
        className="text-6xl sm:text-7xl font-bold mb-1 sm:mb-2 font-mono"
        style={{ color: statusColor }}
      >
        {points >= 0 ? '+' : ''}{points}
      </motion.div>
      <div className="text-xs sm:text-sm text-white/60 mb-6 sm:mb-8 px-2">{getRevealMessage(round.result, t)}</div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-2 rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6 text-left"
      >
        <div className="flex items-start gap-3 mb-3 sm:mb-4">
          <div
            className="w-2.5 h-12 sm:w-3 rounded-full flex-shrink-0 mt-1"
            style={{ background: color, boxShadow: `0 0 12px ${color}88` }}
          />
          <div className="flex-1 min-w-0">
            <h3
              className="text-xl sm:text-2xl mb-1 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.95)' }}
            >
              {fn(round.figure)}
            </h3>
            <div className="text-[11px] sm:text-xs text-white/40 font-mono">
              {fy(round.figure.birthYear)} → {fy(round.figure.deathYear)}
              <span className="mx-2 text-white/20">|</span>
              {round.figure.country} · {fc(round.figure.category)}
            </div>
          </div>
        </div>

        <YearDistanceBar
          targetYear={round.year}
          birthYear={round.figure.birthYear}
          deathYear={round.figure.deathYear}
          color={color}
        />

        <p className="text-xs sm:text-sm text-white/55 mt-4 leading-relaxed">
          {round.figure.description}
        </p>
      </motion.div>

      <button
        onClick={onNext}
        className="px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
        }}
      >
        {isLastRound ? t('game.seeResults') : t('game.nextRound')}
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
  const { locale } = useTranslation()
  const bcSuffix = locale === 'es' ? 'aC' : 'BC'
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
        {birthYear < 0 ? Math.abs(birthYear) + bcSuffix : birthYear}
      </div>
      <div className="absolute -bottom-1 text-[9px] font-mono text-white/40 transform -translate-x-1/2" style={{ left: `${lifeStart + lifeWidth}%` }}>
        {deathYear < 0 ? Math.abs(deathYear) + bcSuffix : deathYear}
      </div>
      <div className="absolute top-0 -translate-x-1/2" style={{ left: `${targetPos}%` }}>
        <div className="w-0.5 h-12 bg-amber-400" style={{ boxShadow: '0 0 6px #f59e0b' }} />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold text-amber-400 whitespace-nowrap">
          {targetYear < 0 ? Math.abs(targetYear) + ' ' + bcSuffix : targetYear}
        </div>
      </div>
    </div>
  )
}
