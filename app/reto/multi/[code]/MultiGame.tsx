'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, Copy, Check, ArrowLeft, Trophy, Swords, X } from 'lucide-react'
import { Room, MAX_LIVES, ROUND_MS } from '@/lib/gameRoom'
import { scoreAnswer } from '@/lib/game'
import { getRank } from '@/lib/ranks'
import { Medal, RankScale } from '@/components/UI/RankMedal'
import { searchFigures } from '@/lib/searchEngine'
import { getCategoryColor } from '@/lib/timelineUtils'
import { useTranslation } from '@/hooks/useLocale'
import figuresData from '@/data/figures.json'
import { HistoricalFigure } from '@/types'

const allFigures = figuresData as HistoricalFigure[]
const POLL_MS = 1500

interface Props { code: string }

// ── Main component ─────────────────────────────────────────────────────────────
export default function MultiGame({ code }: Props) {
  const router = useRouter()
  const { fn, fc, fy } = useTranslation()

  const [room, setRoom] = useState<Room | null>(null)
  const [mySlot, setMySlot] = useState<'p1' | 'p2' | null>(null)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_MS / 1000)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextCalledRef = useRef(false)

  useEffect(() => {
    const slot = localStorage.getItem(`multi-slot-${code}`) as 'p1' | 'p2' | null
    if (!slot) { router.replace('/reto/multi'); return }
    setMySlot(slot)
  }, [code, router])

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`)
      if (!res.ok) return
      const data: Room = await res.json()
      setRoom(data)
      return data
    } catch { return null }
  }, [code])

  useEffect(() => {
    fetchRoom()
    const id = setInterval(fetchRoom, POLL_MS)
    return () => clearInterval(id)
  }, [fetchRoom])

  // Countdown
  useEffect(() => {
    if (!room || room.phase !== 'playing') return
    const tick = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((room.roundDeadline - Date.now()) / 1000)))
    }, 200)
    return () => clearInterval(tick)
  }, [room?.phase, room?.roundDeadline])

  // Auto-submit on timeout
  useEffect(() => {
    if (!room || !mySlot || room.phase !== 'playing' || hasAutoSubmitted) return
    const me = room[mySlot]
    if (!me || me.eliminated || me.answeredRound === room.roundIndex) return
    if (Date.now() >= room.roundDeadline) {
      setHasAutoSubmitted(true)
      submitAnswer(null)
    }
  })

  useEffect(() => {
    setHasAutoSubmitted(false)
    setQuery('')
    nextCalledRef.current = false
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [room?.roundIndex])

  // Auto-advance reveal → next
  useEffect(() => {
    if (!room || room.phase !== 'reveal' || nextCalledRef.current) return
    if (Date.now() < room.revealDeadline) return
    nextCalledRef.current = true
    fetch(`/api/rooms/${code}/next`, { method: 'POST' }).then(fetchRoom)
  })

  const submitAnswer = useCallback(async (figureId: number | null) => {
    if (!mySlot) return
    setQuery('')
    const res = await fetch(`/api/rooms/${code}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: mySlot, figureId }),
    })
    const { room: updated } = await res.json()
    if (updated) setRoom(updated)
  }, [code, mySlot])

  const results = useMemo(() => searchFigures(query, allFigures, 50), [query])

  if (!room || !mySlot) return <LoadingScreen />

  const me = room[mySlot]
  const opponentSlot = mySlot === 'p1' ? 'p2' : 'p1'
  const opponent = room[opponentSlot]
  const year = room.years[room.roundIndex]
  const myAnswered = me?.answeredRound === room.roundIndex
  const isEliminated = me?.eliminated ?? false
  const timerPct = timeLeft / (ROUND_MS / 1000)
  const timerColor = timerPct > 0.5 ? '#10b981' : timerPct > 0.25 ? '#f59e0b' : '#ef4444'

  // ── WAITING ──────────────────────────────────────────────────────────────────
  if (room.phase === 'waiting') {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/reto/multi/${code}` : ''
    return (
      <Screen code={code}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-xs mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
            <Swords size={28} className="text-white" />
          </div>
          <div className="text-xs font-mono text-indigo-400 tracking-widest uppercase mb-2">Reto 1 vs 1</div>
          <h2 className="text-2xl font-semibold text-white/90 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Sala creada
          </h2>
          <p className="text-sm text-white/40 mb-8">Comparte el código con tu rival para empezar</p>

          <div className="glass-2 rounded-2xl p-6 w-full mb-4">
            <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-3">Código de sala</div>
            <div className="text-5xl font-mono font-bold tracking-[0.25em] mb-5"
              style={{ background: 'linear-gradient(135deg, #a5b4fc, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {code}
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: copied ? '#10b981' : '#a5b4fc', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}` }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Enlace copiado' : 'Copiar enlace de invitación'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span>{room.p1.name} conectado · esperando rival…</span>
          </div>
        </motion.div>
      </Screen>
    )
  }

  // ── FINISHED ─────────────────────────────────────────────────────────────────
  if (room.phase === 'finished') {
    const p1 = room.p1
    const p2 = room.p2!
    const winner = p1.score > p2.score ? 'p1' : p2.score > p1.score ? 'p2' : null
    const iWon = winner === mySlot
    const isDraw = !winner
    const myPlayer = room[mySlot]!
    const oppPlayer = room[opponentSlot]!
    const myRank = getRank(myPlayer.score)
    const oppRank = getRank(oppPlayer.score)

    return (
      <Screen code={code}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Result headline */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
              className="text-5xl mb-3"
            >
              {isDraw ? '🤝' : iWon ? '🏆' : '💀'}
            </motion.div>
            <h2 className="text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.92)' }}>
              {isDraw ? '¡Empate!' : iWon ? '¡Has ganado!' : `¡Ha ganado ${oppPlayer.name}!`}
            </h2>
            <p className="text-sm text-white/35 font-mono">{room.roundIndex} rondas jugadas</p>
          </div>

          {/* Player cards with rank medals */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([['p1', p1, mySlot === 'p1'], ['p2', p2, mySlot === 'p2']] as const).map(([slot, player, isMe]) => {
              const rank = getRank(player.score)
              const isWinner = winner === slot
              return (
                <motion.div key={slot}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isMe ? 0.2 : 0.35 }}
                  className="glass-2 rounded-2xl p-4 flex flex-col items-center text-center"
                  style={{ border: isWinner ? `1px solid ${rank.color}44` : undefined, boxShadow: isWinner ? `0 0 20px ${rank.glow}` : undefined }}
                >
                  <div className="text-[9px] font-mono tracking-widest uppercase mb-2"
                    style={{ color: isMe ? '#a5b4fc' : 'rgba(255,255,255,0.3)' }}>
                    {isMe ? 'TÚ' : 'RIVAL'}
                  </div>
                  <Medal rank={rank} size={52} />
                  <div className="text-[10px] font-mono mt-1.5 mb-1" style={{ color: rank.color }}>{rank.name}</div>
                  <div className="text-sm font-semibold text-white/85 truncate w-full mb-2">{player.name}</div>
                  <div className="text-2xl font-mono font-bold mb-1" style={{ color: isWinner ? rank.color : 'rgba(255,255,255,0.6)' }}>
                    {player.score > 0 ? `+${player.score}` : player.score}
                  </div>
                  <div className="text-[10px] text-white/30 mb-2">puntos</div>
                  <div className="flex gap-1">
                    {Array.from({ length: MAX_LIVES }).map((_, i) => (
                      <Heart key={i} size={10}
                        fill={i < player.lives ? '#ef4444' : 'none'}
                        stroke={i < player.lives ? '#ef4444' : 'rgba(255,255,255,0.15)'} />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* My rank description */}
          <div className="glass rounded-xl px-4 py-3 mb-6 text-center"
            style={{ border: `1px solid ${myRank.color}22` }}>
            <div className="text-xs text-white/40">{myRank.description}</div>
          </div>

          {/* Rank scale */}
          <div className="glass rounded-xl px-4 py-3 mb-6">
            <div className="text-[9px] font-mono text-white/25 tracking-widest uppercase mb-3">Escala de rangos</div>
            <RankScale currentScore={myPlayer.score} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => router.push('/reto/multi')}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
              Nueva sala
            </button>
            <button onClick={() => router.push('/')}
              className="px-4 py-3 rounded-xl text-sm text-white/55 bg-white/5 hover:bg-white/10 transition-all">
              Inicio
            </button>
          </div>
        </motion.div>
      </Screen>
    )
  }

  // ── REVEAL ───────────────────────────────────────────────────────────────────
  if (room.phase === 'reveal') {
    const roundYear = room.years[room.roundIndex]
    return (
      <Screen code={code}>
        <div className="w-full max-w-sm mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <div className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-2">Año objetivo</div>
            <div className="text-6xl font-mono font-bold"
              style={{ background: 'linear-gradient(135deg, #a5b4fc, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {roundYear > 0 ? roundYear : `${Math.abs(roundYear)} a.C.`}
            </div>
          </motion.div>

          <div className="space-y-3 mb-4">
            {([['p1', room.p1], ['p2', room.p2]] as const).map(([slot, player], idx) => {
              if (!player) return null
              const isMe = slot === mySlot
              const pts = player.answeredPoints
              const ptColor = pts !== null && pts > 0 ? '#10b981' : pts === 0 ? '#94a3b8' : '#ef4444'
              const statusText = pts === null ? '—' : pts === 10 ? '¡Estaba vivo!' : pts > 0 ? `+${pts} pts` : `${pts} pts`
              return (
                <motion.div key={slot}
                  initial={{ opacity: 0, x: isMe ? -16 : 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-2 rounded-2xl p-4"
                  style={{ border: isMe ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-mono text-white/35 tracking-wider">
                      {isMe ? 'TÚ' : 'RIVAL'} · <span className="text-white/55">{player.name}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: MAX_LIVES }).map((_, i) => (
                        <Heart key={i} size={10}
                          fill={i < player.lives ? '#ef4444' : 'none'}
                          stroke={i < player.lives ? '#ef4444' : 'rgba(255,255,255,0.15)'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/85 truncate max-w-[60%]">
                      {player.answeredFigureName ?? (player.eliminated ? 'Eliminado' : 'Sin respuesta')}
                    </div>
                    <div className="text-lg font-mono font-bold" style={{ color: ptColor }}>{statusText}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
              Siguiente ronda en un momento…
            </div>
          </div>
        </div>
      </Screen>
    )
  }

  // ── PLAYING ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--void)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2">
        <button onClick={() => router.push('/reto')} className="text-white/25 hover:text-white/60 transition-colors">
          <ArrowLeft size={17} />
        </button>
        <div className="text-[10px] font-mono text-white/25 tracking-widest uppercase">
          Ronda {room.roundIndex + 1} · 1 vs 1
        </div>
        <div className="text-xs font-mono text-white/40">
          {mySlot === 'p1' ? room.p1.name : room.p2?.name ?? '…'}
        </div>
      </div>

      {/* Players bar */}
      <div className="px-4 sm:px-6 pb-2">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <PlayerChip player={room.p1} isMe={mySlot === 'p1'} answered={room.p1.answeredRound === room.roundIndex} />
          <div className="flex-1 text-center text-xs font-mono text-white/20">vs</div>
          <PlayerChip player={room.p2 ?? { name: '…', score: 0, lives: 3, eliminated: false, answeredRound: null, answeredFigureId: null, answeredFigureName: null, answeredPoints: null }}
            isMe={mySlot === 'p2'} answered={(room.p2?.answeredRound ?? -1) === room.roundIndex} reverse />
        </div>
      </div>

      {/* Timer bar */}
      <div className="px-4 sm:px-6 mb-1">
        <div className="max-w-lg mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full transition-colors duration-500"
            animate={{ width: `${timerPct * 100}%` }}
            transition={{ duration: 0.2 }}
            style={{ background: timerColor, boxShadow: `0 0 8px ${timerColor}` }} />
        </div>
        <div className="max-w-lg mx-auto flex justify-end mt-0.5">
          <span className="text-[10px] font-mono" style={{ color: timerPct < 0.25 ? timerColor : 'rgba(255,255,255,0.25)' }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main playing area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-4 overflow-y-auto">
        <div className="max-w-lg w-full">
          {/* Year */}
          <AnimatePresence mode="wait">
            <motion.div key={room.roundIndex}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 160, damping: 14 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="text-[10px] sm:text-[11px] font-mono text-white/30 tracking-widest uppercase mb-3">
                ¿Quién vivió en…
              </div>
              <div className="text-6xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tight"
                style={{ background: 'linear-gradient(135deg, #a5b4fc 0%, #f9a8d4 50%, #fcd34d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {year > 0 ? year : `${Math.abs(year)} a.C.`}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Search or waiting */}
          {!myAnswered && !isEliminated ? (
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Escribe el nombre de un personaje histórico…"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-white/5 border border-white/12 rounded-2xl pl-10 pr-4 py-3.5 sm:py-4 text-sm sm:text-base text-white/90 placeholder-white/30 outline-none focus:border-indigo-400/50 focus:bg-white/8 transition-all"
              />
              <AnimatePresence>
                {query && results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-2 w-full z-30 glass-2 rounded-2xl border border-white/12 shadow-2xl overflow-y-auto"
                    style={{ maxHeight: '50vh' }}
                  >
                    {results.map((r, i) => {
                      const color = getCategoryColor(r.figure.category)
                      return (
                        <motion.button key={r.figure.id}
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => submitAnswer(r.figure.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 text-left hover:bg-white/6 active:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white/90 truncate">{fn(r.figure)}</div>
                            <div className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">
                              {r.figure.country} · {fy(r.figure.birthYear)} – {fy(r.figure.deathYear)}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium flex-shrink-0"
                            style={{ background: `${color}22`, color }}>
                            {fc(r.figure.category)}
                          </span>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl py-5 text-center">
              {isEliminated ? (
                <div className="flex flex-col items-center gap-2">
                  <X size={20} className="text-red-400" />
                  <p className="text-sm text-white/45">Eliminado · Observando la partida…</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-sm text-white/60">Respuesta enviada</span>
                  <span className="text-white/20">·</span>
                  <span className="text-sm text-white/40">Esperando al rival…</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function PlayerChip({ player, isMe, answered, reverse = false }: {
  player: { name: string; score: number; lives: number; eliminated: boolean }
  isMe: boolean; answered: boolean; reverse?: boolean
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'items-end' : 'items-start'} min-w-0`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">{isMe ? 'Tú' : 'Rival'}</span>
        {answered && <Check size={9} className="text-emerald-400 flex-shrink-0" />}
      </div>
      <div className="text-xs font-semibold text-white/75 truncate max-w-[90px]">{player.name}</div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-sm font-mono font-bold" style={{ color: isMe ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}>
          {player.score > 0 ? `+${player.score}` : player.score}
        </span>
        <div className={`flex gap-0.5 ${reverse ? 'flex-row-reverse' : ''}`}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart key={i} size={9}
              fill={i < player.lives ? '#ef4444' : 'none'}
              stroke={i < player.lives ? '#ef4444' : 'rgba(255,255,255,0.15)'} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Screen({ children, code }: { children: React.ReactNode; code: string }) {
  const router = useRouter()
  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center px-4 py-8 overflow-y-auto" style={{ background: 'var(--void)' }}>
      <button onClick={() => router.push('/reto')}
        className="fixed top-4 left-4 text-white/25 hover:text-white/60 transition-colors z-10">
        <ArrowLeft size={17} />
      </button>
      {children}
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="h-[100dvh] flex items-center justify-center" style={{ background: 'var(--void)' }}>
      <div className="flex items-center gap-2.5 text-white/35">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-sm font-mono">Conectando…</span>
      </div>
    </main>
  )
}
