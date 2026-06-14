import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Room } from '@/lib/gameRoom'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const raw = await redis.get(`room:${params.code.toUpperCase()}`)
  if (!raw) return NextResponse.json({ error: 'room not found' }, { status: 404 })
  const room: Room = typeof raw === 'string' ? JSON.parse(raw) : raw as Room
  return NextResponse.json(room)
}
