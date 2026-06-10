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
    const fullText = `${text}\n${url}`

    // Try Web Share API first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Human Timeline', text, url })
        return
      } catch (err: any) {
        // User cancelled — don't fall back to clipboard in that case
        if (err?.name === 'AbortError') return
        // Otherwise fall through to clipboard
      }
    }

    // Fall back to clipboard
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText)
      } else {
        // Last resort: temporary textarea
        const ta = document.createElement('textarea')
        ta.value = fullText
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Truly nothing worked — open mail/whatsapp deep link
      window.prompt(t('result.shareLink'), fullText)
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
