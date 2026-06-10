import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'

export default function ResultNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--void)' }}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-2xl font-semibold text-white/85 mb-3">
          Resultado no válido
        </h1>
        <p className="text-white/45 text-sm mb-8">
          Este enlace no apunta a un resultado conocido. Tal vez ha caducado o se ha roto al copiarlo.
        </p>
        <Link
          href="/reto"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}
        >
          <Gamepad2 size={15} /> Jugar el reto
        </Link>
      </div>
    </main>
  )
}
