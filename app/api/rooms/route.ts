import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Room, makePlayer, generateRoomCode, generateYearSequence, ROOM_TTL, ROUND_MS } from '@/lib/gameRoom'
import { goodYears } from '@/lib/game'

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const code = generateRoomCode()
  const seed = Math.floor(Math.random() * 1_000_000)
  const years = generateYearSequence(seed, goodYears)

  const room: Room = {
    code,
    seed,
    phase: 'waiting',
    roundIndex: 0,
    years,
    roundDeadline: 0,
    revealDeadline: 0,
    p1: makePlayer(name.trim()),
    p2: null,
  }

  await redis.set(`room:${code}`, JSON.stringify(room), { ex: ROOM_TTL })
  return NextResponse.json({ code })
}
