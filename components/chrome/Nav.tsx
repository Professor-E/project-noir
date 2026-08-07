'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cartCount, useCart } from '@/lib/cart-store'
import { lock, unlock } from '@/lib/scroll-lock'
import { DUR, EASE_CSS, prefersReducedMotion, stagger } from '@/lib/motion'

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
    transitionTimingFunction: EASE_CSS.smooth,
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
  const [mounted, setMounted] = useState(false)

  const lines = useCart((state) => state.lines)
  const toggle = useCart((state) => state.toggle)
  // The cart is persisted to localStorage, so the count only becomes readable
  // after mount; before that the badge renders exactly as the server sent it.
  const count = mounted ? cartCount(lines) : 0

  useEffect(() => {
    // One-time client-only capability check (media query); no value to read
    // this from during render, so an effect is correct here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    lock()
    return unlock
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Visual bar only — kept a separate fixed element (not nested inside the
          header below) because `position: fixed` always creates its own
          stacking context, so anything nested inside it can never escape to
          paint above a same-level fixed sibling like the cursor dot. This is
          the bottom layer: bar, then the cursor circle, then the nav text. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[76px] border-b transition-[background-color,backdrop-filter,border-color] ${
          scrolled
            ? 'border-bone/10 bg-void/70 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
        style={transitionStyle(reduced)}
      />

      <header
        className="fixed inset-x-0 top-0 z-[210] grid h-[76px] grid-cols-3 items-center px-6 md:px-10"
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
            data-cart-button
            aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
            data-cursor
            onClick={toggle}
            className="eyebrow relative border border-bone/20 px-3 py-2 transition-colors hover:border-bone/50"
          >
            Cart
            {count > 0 && (
              <span
                aria-hidden
                className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-crema px-1 text-[0.625rem] leading-none tracking-normal tabular-nums text-void"
              >
                {count}
              </span>
            )}
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

      {/* The closed menu is still laid out (it fades, so it cannot be
          display:none), so `inert` is what keeps its four links out of the tab
          order rather than leaving invisible stops between the menu button and
          the page content. Split into a solid backdrop (below the cursor) and
          a transparent content layer (above it) for the same reason as the
          header bar above — a fixed element traps its own descendants. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] bg-void md:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: reduced ? '0s' : `${DUR.base}s`,
          transitionTimingFunction: EASE_CSS.smooth,
        }}
      />
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[210] flex flex-col items-center justify-center gap-8 md:hidden ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: menuOpen ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: reduced ? '0s' : `${DUR.base}s`,
          transitionTimingFunction: EASE_CSS.smooth,
        }}
        inert={!menuOpen}
        aria-hidden={!menuOpen}
      >
        {LINKS.map((link, i) => (
          <div
            key={link.href}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: reduced ? '0s' : `${DUR.base}s`,
              transitionTimingFunction: EASE_CSS.smooth,
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
