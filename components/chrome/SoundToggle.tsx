'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { DUR, EASE, prefersReducedMotion, stagger } from '@/lib/motion'

const BAR_COUNT = 4

export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const barsRef = useRef<(HTMLSpanElement | null)[]>([])
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = 0.25
  }, [])

  useEffect(() => {
    const bars = barsRef.current.filter((bar): bar is HTMLSpanElement => bar !== null)
    if (bars.length === 0) return

    if (!playing) {
      gsap.killTweensOf(bars)
      gsap.to(bars, { scaleY: 0.35, duration: DUR.fast, ease: EASE.smooth })
      return
    }

    // Static, non-looping "on" state when the user prefers reduced motion.
    if (prefersReducedMotion()) {
      gsap.to(bars, { scaleY: 0.8, duration: DUR.fast, ease: EASE.smooth })
      return
    }

    const tweens = bars.map((bar, i) =>
      gsap.to(bar, {
        scaleY: 1,
        duration: DUR.fast,
        ease: EASE.smooth,
        repeat: -1,
        yoyo: true,
        delay: stagger(i),
      })
    )

    return () => {
      tweens.forEach((tween) => tween.kill())
    }
  }, [playing])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    // Must be called synchronously within the click handler to satisfy
    // browser autoplay policy.
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  return (
    <>
      <audio ref={audioRef} loop preload="none" src="/audio/ambience.mp3" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Sound On' : 'Sound Off'}
        aria-pressed={playing}
        data-cursor
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center gap-[3px] rounded-full border border-bone/20 bg-void/60 backdrop-blur-md transition-colors hover:border-bone/50"
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              barsRef.current[i] = el
            }}
            className="h-3 w-[3px] origin-center rounded-full bg-crema"
            style={{ transform: 'scaleY(0.35)' }}
          />
        ))}
      </button>
    </>
  )
}
