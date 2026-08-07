'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DUR, EASE, stagger } from '@/lib/motion'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const linkTransition = {
  transitionDuration: `${DUR.fast}s`,
  transitionTimingFunction: EASE.smooth,
}

function NavLink({
  href,
  label,
  onClick,
  large,
}: {
  href: string
  label: string
  onClick?: () => void
  large?: boolean
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
        style={linkTransition}
      />
    </Link>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
        style={linkTransition}
      >
        <Link href="/" data-cursor className="display justify-self-start text-xl">
          NOIR
        </Link>

        <nav className="hidden justify-self-center md:block" aria-label="Primary">
          <ul className="flex items-center gap-10">
            {LINKS.map((link) => (
              <li key={link.href}>
                <NavLink {...link} />
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
                ...linkTransition,
                transform: menuOpen ? 'translateY(3.5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="h-px w-5 bg-bone transition-transform"
              style={{
                ...linkTransition,
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
          transitionDuration: `${DUR.base}s`,
          transitionTimingFunction: EASE.smooth,
        }}
        aria-hidden={!menuOpen}
      >
        {LINKS.map((link, i) => (
          <div
            key={link.href}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: `${DUR.base}s`,
              transitionTimingFunction: EASE.smooth,
              transitionDelay: `${stagger(i)}s`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <NavLink {...link} large onClick={closeMenu} />
          </div>
        ))}
      </div>
    </>
  )
}
