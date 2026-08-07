'use client'

import { BEATS, beatOpacity } from '@/lib/beats'
import { useScrollProgress } from './FrameSequence'
import { prefersReducedMotion } from '@/lib/motion'
import { useEffect, useState } from 'react'

export default function KineticType() {
  const progress = useScrollProgress()
  const [reduced, setReduced] = useState(false)

  // Deferred to an effect (not a lazy useState initializer) so the server-rendered
  // markup and the client's first paint match; the media query only exists client-side.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setReduced(prefersReducedMotion()), [])

  if (reduced) {
    return (
      <div className="flex h-full flex-col justify-center gap-6 px-8">
        {BEATS.map((beat) => (
          <div key={beat.word}>
            <h2 className="display text-[12vw]">{beat.word}</h2>
            <p className="eyebrow mt-2">{beat.sub}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {BEATS.map((beat) => {
        const opacity = beatOpacity(beat, progress)
        return (
          <div
            key={beat.word}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              opacity,
              transform: `scale(${0.96 + opacity * 0.04})`,
              willChange: 'opacity, transform',
            }}
          >
            <h2 className="display text-center text-[clamp(4rem,18vw,17rem)] tracking-[-0.03em]">
              {beat.word}
            </h2>
            <p className="eyebrow mt-6 text-center">{beat.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
