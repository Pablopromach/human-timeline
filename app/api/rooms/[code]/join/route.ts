import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Room, makePlayer, ROOM_TTL, ROUND_MS } from '@/lib/gameRoom'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const key = `room:${params.code.toUpperCase()}`
  const raw = await redis.get(key)
  if (!raw) return NextResponse.json({ error: 'room not found' }, { status: 404 })

  const room: Room = typeof raw === 'string' ? JSON.parse(raw) : raw as Room

  if (room.p2) return NextResponse.json({ error: 'room full' }, { status: 409 })
  if (room.phase !== 'waiting') return NextResponse.json({ error: 'game already started' }, { status: 409 })

  room.p2 = makePlayer(name.trim())
  room.phase = 'playing'
  room.roundDeadline = Date.now() + ROUND_MS

  await redis.set(key, JSON.stringify(room), { ex: ROOM_TTL })
  return NextResponse.json({ ok: true })
}
