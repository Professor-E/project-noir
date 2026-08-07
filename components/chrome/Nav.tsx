'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DUR, EASE, prefersReducedMotion, stagger } from '@/lib/motion'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

// Reduced motion collapses every transition/delay to 0s instead of skipping
// the transition classes entirely, so state (scrolled, menuOpen, hover)
// still updates instantly and correctly — just without animating.
function transitionStyle(reduced: boolean) {
  return {
    transitionDuration: reduced ? '0s' : `${DUR.fast}s`,
    transitionTimingFunction: EASE.smooth,
  }
}

function NavLink({
  href,
  label,
  onClick,
  large,
  reduced,
}: {
  href: string
  label: string
  onClick?: () => void
  large?: boolean
  reduced: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-cursor
      className={`group relative inline-block ${
        large ? 'display text-4xl' : 'py-1 text-sm uppercase tracking-[0.08em] text-bone/90 hover:text-bone'
      }`}
    >
      {label}
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-0.5 h-px w-0 bg-crema transition-[width] group-hover:w-full"
        style={transitionStyle(reduced)}
      />
    </Link>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // One-time client-only capability check (media query); no value to read
    // this from during render, so an effect is correct here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 grid grid-cols-3 items-center border-b px-6 py-5 transition-[background-color,backdrop-filter,border-color] md:px-10 ${
          scrolled
            ? 'border-bone/10 bg-void/70 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
        style={transitionStyle(reduced)}
      >
        <Link href="/" data-cursor className="display justify-self-start text-xl">
          NOIR
        </Link>

        <nav className="hidden justify-self-center md:block" aria-label="Primary">
          <ul className="flex items-center gap-10">
            {LINKS.map((link) => (
              <li key={link.href}>
                <NavLink {...link} reduced={reduced} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end gap-4">
          <button
            type="button"
            aria-label="Open cart"
            data-cursor
            // Task 7 wires this to useCart().toggle(); inert until then.
            onClick={() => {}}
            className="eyebrow border border-bone/20 px-3 py-2 transition-colors hover:border-bone/50"
          >
            Cart
          </button>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            data-cursor
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className="h-px w-5 bg-bone transition-transform"
              style={{
                ...transitionStyle(reduced),
                transform: menuOpen ? 'translateY(3.5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="h-px w-5 bg-bone transition-transform"
              style={{
                ...transitionStyle(reduced),
                transform: menuOpen ? 'translateY(-3.5px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-void md:hidden ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: menuOpen ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: reduced ? '0s' : `${DUR.base}s`,
          transitionTimingFunction: EASE.smooth,
        }}
        aria-hidden={!menuOpen}
      >
        {LINKS.map((link, i) => (
          <div
            key={link.href}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: reduced ? '0s' : `${DUR.base}s`,
              transitionTimingFunction: EASE.smooth,
              transitionDelay: reduced ? '0s' : `${stagger(i)}s`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <NavLink {...link} large onClick={closeMenu} reduced={reduced} />
          </div>
        ))}
      </div>
    </>
  )
}
