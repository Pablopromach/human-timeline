import type { Metadata } from 'next'
import RetoGame from './RetoGame'
import { SITE } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Reto Histórico — ¿Quién vivió en este año?',
  description: 'Juego rápido: te damos un año, tú adivinas qué personaje histórico vivió en él. 10 rondas, puntuación final, compártela.',
  alternates: { canonical: `${SITE.url}/reto` },
  openGraph: {
    title: 'Reto Histórico · Human Timeline',
    description: '¿Eres capaz de adivinar quién vivió en cada año? 10 rondas para demostrarlo.',
    url: `${SITE.url}/reto`,
    type: 'website',
  },
}

export default function RetoPage() {
  return <RetoGame />
}
