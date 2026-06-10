'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const MOBILE_BREAKPOINT = 768
const STORAGE_KEY = 'human-timeline-allow-desktop'

export default function MobileRedirect() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // If user explicitly chose to see desktop on this device, respect it
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        setChecked(true)
        return
      }
    } catch {}

    // If URL has ?desktop=1, honor that and remember it for the session
    const params = new URLSearchParams(window.location.search)
    if (params.get('desktop') === '1') {
      try { sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
      setChecked(true)
      return
    }

    // Redirect mobile users to the game
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      router.replace('/reto')
    } else {
      setChecked(true)
    }
  }, [router])

  // Render nothing — this just gates the home page on mobile
  return null
}
