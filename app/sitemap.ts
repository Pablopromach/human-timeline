import type { MetadataRoute } from 'next'
import figuresData from '@/data/figures.json'
import { HistoricalFigure } from '@/types'
import { figureSlug } from '@/lib/slug'
import { SITE } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const figures = figuresData as HistoricalFigure[]

  const figurePages: MetadataRoute.Sitemap = figures.map(f => ({
    url: `${SITE.url}/personaje/${figureSlug(f)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE.url}/reto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...figurePages,
  ]
}
