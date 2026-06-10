import type { Metadata, Viewport } from 'next'
import { SITE } from '@/lib/seo'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Human Timeline — Explora 6.000 años de historia humana',
    template: '%s · Human Timeline',
  },
  description: SITE.description,
  keywords: [
    'historia', 'timeline interactivo', 'personajes históricos', 'historia universal',
    'línea del tiempo', 'humanidad', 'visualización histórica',
    'Napoleón', 'Einstein', 'Julio César', 'Leonardo da Vinci', 'Cleopatra',
    'historia antigua', 'edad media', 'renacimiento', 'historia moderna',
  ],
  authors: [{ name: 'Human Timeline' }],
  creator: 'Human Timeline',
  publisher: 'Human Timeline',
  alternates: { canonical: SITE.url },
  openGraph: {
    title: 'Human Timeline — 6.000 años de historia humana',
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Human Timeline',
    description: '6.000 años de historia humana en un timeline interactivo.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true, follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: { icon: '/favicon.ico' },
  category: 'education',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: 'es-ES',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="noise antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
