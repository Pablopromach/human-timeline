'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, Copy, Check, ArrowLeft, Trophy, Swords } from 'lucide-react'
import { Room, MAX_LIVES } from '@/lib/gameRoom'
import { scoreAnswer } from '@/lib/game'
import { searchFigures } from '@/lib/searchEngine'
import { getCategoryColor } from '@/lib/timelineUtils'
import { useTranslation } from '@/hooks/useLocale'
import figuresData from '@/data/figures.json'
import { HistoricalFigure } from '@/types'

const allFigures = figuresData as HistoricalFigure[]
const POLL_MS = 1500

interface Props { code: string }

export default function MultiGame({ code }: Props) {
  const router = useRouter()
  const { fn, fc, fy } = useTranslation()

  const [room, setRoom] = useState<Room | null>(null)
  const [mySlot, setMySlot] = useState<'p1' | 'p2' | null>(null)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextCalledRef = useRef(false)

  // Read player slot from localStorage
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

  // Polling
  useEffect(() => {
    fetchRoom()
    pollRef.current = setInterval(fetchRoom, POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchRoom])

  // Countdown timer
  useEffect(() => {
    if (!room || room.phase !== 'playing') return
    const tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((room.roundDeadline - Date.now()) / 1000))
      setTimeLeft(left)
    }, 500)
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

  // Reset auto-submit flag on new round
  useEffect(() => {
    setHasAutoSubmitted(false)
    setQuery('')
    nextCalledRef.current = false
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [room?.roundIndex])

  // Auto-advance from reveal to next round
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

  const results = useMemo(() =>
    searchFigures(query, allFigures, 50),
    [query]
  )

  if (!room || !mySlot) return <LoadingScreen />

  const me = room[mySlot]
  const opponentSlot = mySlot === 'p1' ? 'p2' : 'p1'
  const opponent = room[opponentSlot]
  const year = room.years[room.roundIndex]
  const myAnswered = me?.answeredRound === room.roundIndex
  const isEliminated = me?.eliminated ?? false

  // --- WAITING ---
  if (room.phase === 'waiting') {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/reto/multi/${code}` : ''
    return (
      <Screen>
        <div className="text-center">
          <Swords size={32} className="text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl text-white/85 font-semibold mb-2">Esperando al rival…</h2>
          <p className="text-sm text-white/45 mb-8">Comparte este código o enlace con tu oponente</p>
          <div className="glass-2 rounded-2xl p-6 mb-4">
            <div className="text-4xl font-mono font-bold tracking-[0.3em] text-white/90 mb-4">{code}</div>
            <button
              onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="flex items-center gap-2 mx-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/50">{room.p1.name} conectado</span>
          </div>
        </div>
      </Screen>
    )
  }

  // --- FINISHED ---
  if (room.phase === 'finished') {
    const p1 = room.p1
    const p2 = room.p2!
    const winner = p1.score > p2.score ? p1 : p2.score > p1.score ? p2 : null
    const iWon = winner && room[mySlot]?.name === winner.name
    return (
      <Screen>
        <div className="text-center max-w-sm mx-auto">
          <Trophy size={40} className="mx-auto mb-4" style={{ color: iWon ? '#f59e0b' : '#94a3b8' }} />
          <h2 className="text-2xl font-semibold text-white/90 mb-1">
            {!winner ? '¡Empate!' : iWon ? '¡Has ganado!' : `¡Ha ganado ${winner.name}!`}
          </h2>
          <p className="text-sm text-white/40 mb-8">{room.roundIndex} rondas jugadas</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[['p1', p1], ['p2', p2]].map(([slot, p]) => {
              const player = p as typeof p1
              const isMe = slot === mySlot
              return (
                <div key={slot as string} className="glass rounded-2xl p-4"
                  style={{ border: isMe ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-xs text-white/40 mb-1 font-mono">{isMe ? 'TÚ' : 'RIVAL'}</div>
                  <div className="text-sm font-semibold text-white/85 truncate mb-3">{player.name}</div>
                  <div className="text-3xl font-mono font-bold" style={{ color: isMe ? '#a5b4fc' : '#94a3b8' }}>
                    {player.score}
                  </div>
                  <div className="text-xs text-white/30 mt-1">puntos</div>
                  <div className="flex gap-1 justify-center mt-3">
                    {Array.from({ length: MAX_LIVES }).map((_, i) => (
                      <Heart key={i} size={12} fill={i < player.lives ? '#ef4444' : 'none'} stroke={i < player.lives ? '#ef4444' : 'rgba(255,255,255,0.2)'} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/reto/multi')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/80 bg-white/8 hover:bg-white/12 transition-all">
              Nueva sala
            </button>
            <button onClick={() => router.push('/')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/80 bg-white/8 hover:bg-white/12 transition-all">
              Inicio
            </button>
          </div>
        </div>
      </Screen>
    )
  }

  // --- REVEAL ---
  if (room.phase === 'reveal') {
    const roundYear = room.years[room.roundIndex]
    return (
      <Screen>
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="text-xs font-mono text-white/35 tracking-widest uppercase mb-1">Año</div>
            <div className="text-5xl font-mono font-bold text-white/90">{roundYear > 0 ? roundYear : `${Math.abs(roundYear)} a.C.`}</div>
          </div>

          <div className="space-y-3">
            {([['p1', room.p1], ['p2', room.p2]] as const).map(([slot, player]) => {
              if (!player) return null
              const isMe = slot === mySlot
              const color = player.answeredPoints !== null && player.answeredPoints > 0 ? '#10b981' : player.answeredPoints === 0 ? '#94a3b8' : '#ef4444'
              return (
                <div key={slot} className="glass-2 rounded-2xl p-4 flex items-center gap-3"
                  style={{ border: isMe ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/35 font-mono mb-0.5">{isMe ? 'TÚ' : 'RIVAL'} · {player.name}</div>
                    <div className="text-sm font-semibold text-white/85 truncate">
                      {player.answeredFigureName ?? (player.eliminated ? 'Eliminado' : '—')}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-mono font-bold" style={{ color }}>
                      {player.answeredPoints !== null ? (player.answeredPoints > 0 ? `+${player.answeredPoints}` : player.answeredPoints) : '—'}
                    </div>
                    <div className="flex gap-0.5 justify-end mt-1">
                      {Array.from({ length: MAX_LIVES }).map((_, i) => (
                        <Heart key={i} size={10} fill={i < player.lives ? '#ef4444' : 'none'} stroke={i < player.lives ? '#ef4444' : 'rgba(255,255,255,0.2)'} />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-xs text-white/30 mt-4">Siguiente ronda en un momento…</p>
        </div>
      </Screen>
    )
  }

  // --- PLAYING ---
  return (
    <Screen>
      <div className="w-full max-w-sm mx-auto">
        {/* Header scores */}
        <div className="flex items-center justify-between mb-6">
          <PlayerBadge player={room.p1} isMe={mySlot === 'p1'} answered={room.p1.answeredRound === room.roundIndex} />
          <div className="text-xs font-mono text-white/30">VS</div>
          <PlayerBadge player={room.p2 ?? { name: '…', score: 0, lives: 3, eliminated: false, answeredRound: null, answeredFigureId: null, answeredFigureName: null, answeredPoints: null }} isMe={mySlot === 'p2'} answered={(room.p2?.answeredRound ?? -1) === room.roundIndex} reverse />
        </div>

        {/* Year */}
        <div className="text-center mb-6">
          <div className="text-xs font-mono text-white/35 tracking-widest uppercase mb-1">¿Quién vivió en…</div>
          <div className="text-6xl font-mono font-bold text-white/95">
            {year > 0 ? year : `${Math.abs(year)} a.C.`}
          </div>
          <div className="mt-2 text-sm font-mono" style={{ color: timeLeft <= 10 ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>
            {timeLeft}s
          </div>
        </div>

        {/* Search */}
        {!myAnswered && !isEliminated ? (
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Busca un personaje histórico…"
              className="w-full bg-white/5 border border-white/12 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-indigo-400/50 transition-all"
            />
            <AnimatePresence>
              {query && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 w-full z-30 glass-2 rounded-2xl border border-white/12 shadow-2xl overflow-y-auto"
                  style={{ maxHeight: '55vh' }}
                >
                  {results.map(r => {
                    const color = getCategoryColor(r.figure.category)
                    return (
                      <button key={r.figure.id}
                        onClick={() => submitAnswer(r.figure.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/6 transition-colors border-b border-white/5 last:border-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white/90 truncate">{fn(r.figure)}</div>
                          <div className="text-[10px] text-white/40">{r.figure.country} · {fy(r.figure.birthYear)}–{fy(r.figure.deathYear)}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0" style={{ background: `${color}22`, color }}>
                          {fc(r.figure.category)}
                        </span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-6">
            {isEliminated ? (
              <p className="text-white/40 text-sm">Has sido eliminado · Observando la partida…</p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-sm">Respuesta enviada · Esperando al rival…</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Screen>
  )
}

function PlayerBadge({ player, isMe, answered, reverse = false }: {
  player: { name: string; score: number; lives: number; eliminated: boolean }
  isMe: boolean; answered: boolean; reverse?: boolean
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'items-end' : 'items-start'} gap-1`}>
      <div className="text-xs text-white/40 font-mono">{isMe ? 'TÚ' : 'RIVAL'}</div>
      <div className="text-sm font-semibold text-white/85">{player.name}</div>
      <div className="text-lg font-mono font-bold text-indigo-300">{player.score} pts</div>
      <div className={`flex gap-1 ${reverse ? 'flex-row-reverse' : ''}`}>
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <Heart key={i} size={11} fill={i < player.lives ? '#ef4444' : 'none'} stroke={i < player.lives ? '#ef4444' : 'rgba(255,255,255,0.2)'} />
        ))}
        {answered && <Check size={11} className="text-green-400 ml-1" />}
      </div>
    </div>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: 'var(--void)' }}>
      <button onClick={() => router.push('/reto')} className="fixed top-4 left-4 text-white/30 hover:text-white/60 transition-colors">
        <ArrowLeft size={18} />
      </button>
      {children}
    </main>
  )
}

function LoadingScreen() {
  return (
    <Screen>
      <div className="flex items-center gap-2 text-white/40">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-sm">Conectando…</span>
      </div>
    </Screen>
  )
}
