'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

type Origin = {
  region: string
  country: string
  image: string
  detail: [string, string]
}

const ORIGINS: Origin[] = [
  {
    region: 'Yirgacheffe',
    country: 'Ethiopia',
    image: '/images/origin-ethiopia.jpg',
    detail: [
      '1,950 – 2,200m, dried eighteen days on raised beds.',
      'Bought lot by lot from four washing stations we visit every harvest.',
    ],
  },
  {
    region: 'Huila',
    country: 'Colombia',
    image: '/images/origin-colombia.jpg',
    detail: [
      '1,700 – 1,900m, washed within hours of picking.',
      'One hillside above the Río Cofres, the same eleven families since 2019.',
    ],
  },
  {
    region: 'Gayo Highlands',
    country: 'Sumatra',
    image: '/images/origin-sumatra.jpg',
    detail: [
      '1,200 – 1,500m, wet-hulled overnight in the Acehnese way.',
      'Paid above the Fair Trade floor, in full, before the container ships.',
    ],
  },
]

// The origin photography is genuine daylight farm work and runs brighter than
// the rest of the site. All three panels carry the same darkening grade so the
// strip reads as one sequence rather than three borrowed pictures.
// See docs/credits.md (photography note).
const PHOTO_GRADE = 'brightness-75 contrast-110 sepia-[.12]'

function Panel({
  origin,
  index,
  className,
}: {
  origin: Origin
  index: number
  className: string
}) {
  return (
    <article className={`relative overflow-hidden ${className}`}>
      <Image
        src={origin.image}
        alt={`Coffee harvest in ${origin.region}, ${origin.country}`}
        fill
        sizes="(min-width: 768px) 62vw, 86vw"
        className={`object-cover ${PHOTO_GRADE}`}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/20"
      />

      <div className="absolute inset-x-0 bottom-0 p-8 md:p-14">
        <span className="eyebrow block">
          {String(index + 1).padStart(2, '0')} — {origin.country}
        </span>
        <h3
          className="display mt-5 text-bone"
          style={{ fontSize: 'clamp(2.75rem, 6vw, 5.5rem)' }}
        >
          {origin.region}
        </h3>
        <div className="mt-6 max-w-[46ch] border-t border-bone/15 pt-6">
          {origin.detail.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-bone/85">
              {line}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function OriginStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the server-rendered
    // markup and the client's first paint match; the media query only exists client-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (reduced || !section || !track) return

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

    // Linear on purpose: a scrubbed tween must track the scrollbar 1:1, so the
    // shared eases do not apply here — `scrub: 1` supplies the smoothing.
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(track, { x: 0 })
    }
  }, [reduced])

  if (reduced) {
    return (
      <section
        aria-labelledby="origin-heading"
        className="relative w-full bg-void px-6 py-32 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <span className="eyebrow block">Sourcing</span>
          <h2
            id="origin-heading"
            className="display mt-6 max-w-[14ch] text-bone"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
          >
            Where it comes from
          </h2>
          <div className="mt-16 flex flex-col gap-10">
            {ORIGINS.map((origin, i) => (
              <Panel
                key={origin.region}
                origin={origin}
                index={i}
                className="h-[70vh] w-full"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="origin-heading"
      className="relative w-full overflow-hidden bg-void"
    >
      <div ref={trackRef} className="flex h-screen w-max items-stretch will-change-transform">
        <div className="flex h-screen w-[86vw] shrink-0 flex-col justify-center px-6 md:w-[52vw] md:px-14">
          <span className="eyebrow block">Sourcing</span>
          <h2
            id="origin-heading"
            className="display mt-6 max-w-[12ch] text-bone"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
          >
            Where it comes from
          </h2>
          <p className="mt-8 max-w-[38ch] text-sm leading-relaxed text-ash">
            Three regions, visited every harvest. Scroll sideways.
          </p>
        </div>

        {ORIGINS.map((origin, i) => (
          <Panel
            key={origin.region}
            origin={origin}
            index={i}
            className="h-screen w-[86vw] shrink-0 md:w-[62vw]"
          />
        ))}
      </div>
    </section>
  )
}
