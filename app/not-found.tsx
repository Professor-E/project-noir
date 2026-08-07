import type { Metadata } from 'next'
import Link from 'next/link'
import { DUR } from '@/lib/motion'

export const metadata: Metadata = {
  title: 'Not found — Noir',
  description: 'The page you asked for is not here.',
}

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-void px-6 py-40 text-center md:px-10"
    >
      {/* Static by design: the 404 is the one page a visitor never chose to
          reach, so it carries no reveal, no scrub and nothing to wait for. */}
      <span className="eyebrow block">Error 404</span>

      <span
        aria-hidden
        className="display mt-8 block text-bone"
        style={{ fontSize: 'clamp(7rem, 34vw, 26rem)' }}
      >
        404
      </span>

      <h1 className="display mt-6 max-w-[18ch] text-bone" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
        This roast has sold out.
      </h1>

      <p className="mt-8 max-w-[42ch] text-sm leading-relaxed text-ash">
        Every origin is held for a single season and then it is gone. Whatever was
        here has been retired — the rest of the range is still on the shelf.
      </p>

      <Link
        href="/"
        data-cursor
        className="relative z-[210] mt-14 inline-flex items-center gap-4 border border-crema/60 px-10 py-5 text-sm uppercase tracking-[0.18em] text-crema transition-colors hover:bg-crema hover:text-void"
        style={{ transitionDuration: `${DUR.fast}s` }}
      >
        Back to Noir
        <span aria-hidden>&rarr;</span>
      </Link>
    </main>
  )
}
