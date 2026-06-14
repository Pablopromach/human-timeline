export type RoomPhase = 'waiting' | 'playing' | 'reveal' | 'finished'

export interface PlayerState {
  name: string
  score: number
  lives: number
  eliminated: boolean
  answeredRound: number | null       // roundIndex when they answered
  answeredFigureId: number | null
  answeredFigureName: string | null
  answeredPoints: number | null
}

export interface Room {
  code: string
  seed: number
  phase: RoomPhase
  roundIndex: number
  years: number[]                    // pre-generated sequence (50 rounds max)
  roundDeadline: number              // unix ms — 60s per round
  revealDeadline: number             // unix ms — 3s reveal
  p1: PlayerState
  p2: PlayerState | null
}

export const ROOM_TTL = 7200        // 2h in Redis
export const ROUND_MS = 60_000      // 60s per round
export const REVEAL_MS = 4_000      // 4s reveal
export const MAX_LIVES = 3

export function makePlayer(name: string): PlayerState {
  return {
    name,
    score: 0,
    lives: MAX_LIVES,
    eliminated: false,
    answeredRound: null,
    answeredFigureId: null,
    answeredFigureName: null,
    answeredPoints: null,
  }
}

export function hasAnswered(player: PlayerState, roundIndex: number): boolean {
  return player.answeredRound === roundIndex
}

export function activePlayers(room: Room): ('p1' | 'p2')[] {
  const slots: ('p1' | 'p2')[] = []
  if (!room.p1.eliminated) slots.push('p1')
  if (room.p2 && !room.p2.eliminated) slots.push('p2')
  return slots
}

export function allAnswered(room: Room): boolean {
  const active = activePlayers(room)
  if (active.length === 0) return true
  return active.every(slot => hasAnswered(room[slot]!, room.roundIndex))
}

// Mulberry32 — fast, deterministic seeded PRNG
function seededRng(seed: number) {
  let s = seed
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateYearSequence(seed: number, goodYears: number[], count = 50): number[] {
  const rng = seededRng(seed)
  const years: number[] = []
  const used: number[] = []

  while (years.length < count) {
    const pool = goodYears.filter(y => !used.some(e => Math.abs(e - y) < 30))
    const arr = pool.length > 0 ? pool : goodYears
    const weighted: number[] = []
    for (const y of arr) {
      const times = y >= 1950 ? 1 : 5
      for (let i = 0; i < times; i++) weighted.push(y)
    }
    const year = weighted[Math.floor(rng() * weighted.length)]
    years.push(year)
    used.push(year)
  }
  return years
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
