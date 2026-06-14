import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Room, allAnswered, activePlayers, ROOM_TTL, REVEAL_MS, MAX_LIVES } from '@/lib/gameRoom'
import { scoreAnswer } from '@/lib/game'
import figuresData from '@/data/figures.json'
import { HistoricalFigure } from '@/types'

const allFigures = figuresData as HistoricalFigure[]

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const { slot, figureId } = await req.json() as { slot: 'p1' | 'p2'; figureId: number | null }

  const key = `room:${params.code.toUpperCase()}`
  const raw = await redis.get(key)
  if (!raw) return NextResponse.json({ error: 'room not found' }, { status: 404 })

  const room: Room = typeof raw === 'string' ? JSON.parse(raw) : raw as Room

  if (room.phase !== 'playing') return NextResponse.json({ ok: true, room })

  const player = room[slot]
  if (!player || player.eliminated) return NextResponse.json({ ok: true, room })
  if (player.answeredRound === room.roundIndex) return NextResponse.json({ ok: true, room })

  const year = room.years[room.roundIndex]

  if (figureId === null) {
    // Timeout — counts as miss
    player.answeredRound = room.roundIndex
    player.answeredFigureId = null
    player.answeredFigureName = null
    player.answeredPoints = -10
    player.lives = Math.max(0, player.lives - 1)
    if (player.lives === 0) player.eliminated = true
  } else {
    const figure = allFigures.find(f => f.id === figureId)
    if (!figure) return NextResponse.json({ error: 'figure not found' }, { status: 404 })
    const result = scoreAnswer(figure, year)
    player.answeredRound = room.roundIndex
    player.answeredFigureId = figureId
    player.answeredFigureName = figure.name
    player.answeredPoints = result.points
    player.score += result.points
    if (result.status !== 'perfect') {
      player.lives = Math.max(0, player.lives - 1)
      if (player.lives === 0) player.eliminated = true
    }
  }

  // Check if all active players answered → reveal
  if (allAnswered(room)) {
    const active = activePlayers(room)
    if (active.length === 0) {
      room.phase = 'finished'
    } else {
      room.phase = 'reveal'
      room.revealDeadline = Date.now() + REVEAL_MS
    }
  }

  await redis.set(key, JSON.stringify(room), { ex: ROOM_TTL })
  return NextResponse.json({ ok: true, room })
}
