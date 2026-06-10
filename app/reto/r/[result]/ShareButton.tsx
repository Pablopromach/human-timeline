'use client'
import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { useTranslation } from '@/hooks/useLocale'

interface Props {
  url: string
  score: number
  mode: 'clasico' | 'infinito'
}

export default function ShareButton({ url, score, mode }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = mode === 'clasico'
      ? t('game.shareText.classic', { score })
      : t('game.shareText.infinite', { score })

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi puntuación', text, url })
        return
      } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/8 text-white/90 hover:bg-white/14 transition-all"
    >
      {copied ? <><Check size={15} /> {t('common.copied')}</> : <><Share2 size={15} /> {t('result.shareLink')}</>}
    </button>
  )
}
