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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 22px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.92)',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {copied ? <><Check size={15} /> {t('common.copied')}</> : <><Share2 size={15} /> {t('result.shareLink')}</>}
    </button>
  )
}
