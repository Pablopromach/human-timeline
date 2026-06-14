'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowRight, Link as LinkIcon } from 'lucide-react'
import HumanTimelineIcon from '@/components/UI/HumanTimelineIcon'
import LanguageSwitcher from '@/components/UI/LanguageSwitcher'

export default function MultiLobby() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'create' | 'join'>('create')

  async function handleCreate() {
    if (!name.trim()) return setError('Escribe tu nombre primero')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const { code } = await res.json()
      localStorage.setItem(`multi-slot-${code}`, 'p1')
      localStorage.setItem(`multi-name-${code}`, name.trim())
      router.push(`/reto/multi/${code}`)
    } catch {
      setError('Error al crear la sala. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!name.trim()) return setError('Escribe tu nombre primero')
    if (!joinCode.trim()) return setError('Escribe el código de la sala')
    setLoading(true); setError('')
    const code = joinCode.trim().toUpperCase()
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) {
        const { error: e } = await res.json()
        setError(e === 'room full' ? 'Sala llena' : e === 'room not found' ? 'Sala no encontrada' : 'Error al unirse')
        setLoading(false)
        return
      }
      localStorage.setItem(`multi-slot-${code}`, 'p2')
      localStorage.setItem(`multi-name-${code}`, name.trim())
      router.push(`/reto/multi/${code}`)
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--void)' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-10">
          <HumanTimelineIcon size={28} />
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-indigo-400" />
          <span className="text-xs font-mono text-indigo-400 tracking-widest uppercase">Modo 1 vs 1</span>
        </div>
        <h1 className="text-3xl font-display text-white/90 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Reto en pareja
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? 'rgba(99,102,241,0.3)' : 'transparent',
                color: tab === t ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
              }}
            >
              {t === 'create' ? 'Crear sala' : 'Unirse'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Tu nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
              placeholder="Napoleón, Cleopatra…"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/85 placeholder-white/25 outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {tab === 'join' && (
            <div>
              <label className="text-xs text-white/40 font-mono uppercase tracking-wider mb-1.5 block">Código de sala</label>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ABC123"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/85 placeholder-white/25 outline-none focus:border-indigo-500/50 transition-all font-mono tracking-widest"
              />
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={tab === 'create' ? handleCreate : handleJoin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
          >
            {loading ? 'Conectando…' : tab === 'create' ? 'Crear sala' : 'Unirse a la sala'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          El creador comparte el código con el rival · Juegan el mismo año simultáneamente
        </p>
      </div>
    </main>
  )
}
