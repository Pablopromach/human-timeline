export const SITE = {
  name: 'Human Timeline',
  url: 'https://human-timeline.vercel.app',
  description:
    'Explora 6.000 años de historia humana en un timeline interactivo. Visualiza, compara y descubre qué personajes históricos coexistieron entre 4000 a.C. y 2026 d.C.',
  twitter: '@humantimeline',
  locale: 'es_ES',
}

export function absoluteUrl(path: string = ''): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE.url}${clean}`
}
