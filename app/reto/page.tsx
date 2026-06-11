import type { Metadata } from 'next'
import RetoGame from './RetoGame'
import { SITE } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Historical Challenge — Who lived in this year?',
  description: 'Quick game: we give you a year, you guess which historical figure lived back then. 10 rounds, final score, share it.',
  alternates: { canonical: `${SITE.url}/reto` },
  openGraph: {
    title: 'Historical Challenge · Human Timeline',
    description: 'Can you guess who lived in each year? 10 rounds to prove it.',
    url: `${SITE.url}/reto`,
    type: 'website',
  },
}

export default function RetoPage() {
  return <RetoGame />
}
