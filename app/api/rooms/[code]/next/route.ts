import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Room, activePlayers, ROOM_TTL, ROUND_MS } from '@/lib/gameRoom'

export async function POST(_req: Request, { params }: { params: { code: string } }) {
  const key = `room:${params.code.toUpperCase()}`
  const raw = await redis.get(key)
  if (!raw) return NextResponse.json({ error: 'room not found' }, { status: 404 })

  const room: Room = typeof raw === 'string' ? JSON.parse(raw) : raw as Room

  if (room.phase !== 'reveal') return NextResponse.json({ ok: true, room })

  // Clear round answers and advance
  for (const slot of ['p1', 'p2'] as const) {
    const p = room[slot]
    if (!p) continue
    p.answeredRound = null
    p.answeredFigureId = null
    p.answeredFigureName = null
    p.answeredPoints = null
  }

  room.roundIndex += 1

  const active = activePlayers(room)
  if (active.length === 0 || room.roundIndex >= room.years.length) {
    room.phase = 'finished'
  } else {
    room.phase = 'playing'
    room.roundDeadline = Date.now() + ROUND_MS
    room.revealDeadline = 0
  }

  await redis.set(key, JSON.stringify(room), { ex: ROOM_TTL })
  return NextResponse.json({ ok: true, room })
}
