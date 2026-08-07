'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DUR, EASE, prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}

export default function Reveal({ children, className, delay = 0, y = 40 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 })
      return
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: DUR.slow,
        delay,
        ease: EASE.expo,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [delay, y])

  return (
    <div ref={ref} data-reveal className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
