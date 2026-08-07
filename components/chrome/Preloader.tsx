'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FRAME_COUNT, framePath } from '@/lib/frames'
import { DUR, EASE } from '@/lib/motion'

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [percent, setPercent] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let loaded = 0
    let cancelled = false

    const bump = () => {
      loaded += 1
      if (!cancelled) setPercent(Math.round((loaded / FRAME_COUNT) * 100))
    }

    const jobs = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image()
      img.src = framePath(i)
      return img
        .decode()
        .catch(() => undefined)
        .finally(bump)
    })

    // Never hold the page hostage: reveal after 8s even if decoding stalls.
    const timeout = new Promise((resolve) => setTimeout(resolve, 8000))

    Promise.race([Promise.all(jobs), timeout]).then(() => {
      if (cancelled) return
      const el = rootRef.current
      if (!el) return setDone(true)
      gsap.to(el, {
        yPercent: -100,
        duration: DUR.curtain,
        ease: EASE.smooth,
        onComplete: () => setDone(true),
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = done ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [done])

  if (done) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
    >
      <span className="display text-[14vw] leading-none">NOIR</span>
      <div className="mt-10 h-px w-48 overflow-hidden bg-ash/25">
        <div
          className="h-full bg-crema transition-[width] duration-200 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="eyebrow mt-4">{percent}%</span>
    </div>
  )
}
