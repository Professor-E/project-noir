'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FRAME_COUNT, frameIndexFor, framePath } from '@/lib/frames'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

const ProgressContext = createContext(0)
export const useScrollProgress = () => useContext(ProgressContext)

type Props = { children?: React.ReactNode; heightVh?: number }

export default function FrameSequence({ children, heightVh = 400 }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server-rendered
    // markup and the client's first paint match; the media query only exists client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Frames are already decoded by the Preloader; these resolve from cache.
    imagesRef.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image()
      img.src = framePath(i)
      return img
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(currentRef.current)
    }

    const draw = (p: number) => {
      const img = imagesRef.current[frameIndexFor(p)]
      if (!img || !img.complete || img.naturalWidth === 0) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const scale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.clearRect(0, 0, vw, vh)
      ctx.drawImage(img, (vw - w) / 2, (vh - h) / 2, w, h)
    }

    if (reduced) {
      resize()
      draw(0.1)
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: canvas.parentElement,
      pinSpacing: false,
      scrub: true,
      onUpdate: (self) => {
        targetRef.current = self.progress
      },
    })

    const tick = () => {
      currentRef.current += (targetRef.current - currentRef.current) * 0.18
      draw(currentRef.current)
      setProgress(currentRef.current)
    }

    gsap.ticker.add(tick)
    resize()
    window.addEventListener('resize', resize)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', resize)
      trigger.kill()
    }
  }, [reduced])

  return (
    <ProgressContext.Provider value={reduced ? 0.1 : progress}>
      <section
        ref={sectionRef}
        style={{ height: reduced ? '100vh' : `${heightVh}vh` }}
        className="relative w-full"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Purely atmospheric: the beat copy layered over it carries the
              meaning, so the canvas is hidden from assistive tech. */}
          <canvas ref={canvasRef} aria-hidden className="h-screen w-full" />
          <div className="pointer-events-none absolute inset-0">{children}</div>
        </div>
      </section>
    </ProgressContext.Provider>
  )
}
