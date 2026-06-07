import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Human Timeline — Explora la Historia de la Humanidad',
  description:
    'Visualiza y compara la vida de los personajes más influyentes de la historia en un timeline interactivo. Desde 4000 a.C. hasta 2026.',
  keywords: [
    'historia', 'timeline', 'personajes históricos', 'humanidad', 'visualización',
    'Napoleón', 'Einstein', 'Julio César', 'Leonardo da Vinci',
  ],
  openGraph: {
    title: 'Human Timeline — Explora la Historia de la Humanidad',
    description: 'Un timeline interactivo de 6000 años de historia humana.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Human Timeline',
    description: '6000 años de historia en un solo gráfico interactivo.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="noise antialiased">{children}</body>
    </html>
  )
}
