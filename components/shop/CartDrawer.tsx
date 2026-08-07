'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { formatUSD, lineKey, linePrice, subtotal, type CartLine } from '@/lib/cart-math'
import { cartCount, useCart } from '@/lib/cart-store'
import { DUR, EASE, prefersReducedMotion } from '@/lib/motion'
import { getProduct } from '@/lib/products'

const MAX_QTY = 9

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * The panel's tab-order members, in DOM order. Rendered-but-invisible nodes are
 * dropped (getClientRects) so a disabled/hidden control can never become the
 * wrap target of the focus trap.
 */
function focusableWithin(panel: HTMLElement | null): HTMLElement[] {
  if (!panel) return []
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  )
}

function summarise(line: CartLine): string {
  return `${line.grind} · ${line.weight} · ${line.subscribe ? 'Subscription' : 'One-time'}`
}

export default function CartDrawer() {
  const lines = useCart((state) => state.lines)
  const isOpen = useCart((state) => state.isOpen)
  const remove = useCart((state) => state.remove)
  const setQty = useCart((state) => state.setQty)
  const close = useCart((state) => state.close)

  const [mounted, setMounted] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [notice, setNotice] = useState('')

  const rootRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const rowRefs = useRef(new Map<string, HTMLLIElement>())
  // The element focus should return to when the drawer closes — captured at the
  // moment it opens, so it is the nav cart button when opened from the nav and
  // the add-to-cart button when a product opened it.
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const hasOpenedRef = useRef(false)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    // Client-only reads (persisted store + reduced-motion media query). Both are
    // deferred to an effect so the first client render matches the server markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setReduced(prefersReducedMotion())
  }, [])

  // The persisted cart is only read after mount; before that the drawer renders
  // the same empty markup the server produced.
  const visible = mounted ? lines : []
  const count = cartCount(visible)

  const handleClose = useCallback(() => {
    setNotice('')
    close()
  }, [close])

  // Normalises GSAP's transform cache to the inline start state rendered on the
  // server, so the first open tweens from off-screen rather than snapping.
  useEffect(() => {
    gsap.set(panelRef.current, { xPercent: 100 })
    gsap.set(scrimRef.current, { opacity: 0 })
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const panel = panelRef.current
    const scrim = scrimRef.current
    if (!root || !panel || !scrim) return

    gsap.killTweensOf([panel, scrim])

    if (isOpen) {
      hasOpenedRef.current = true
      gsap.set(root, { visibility: 'visible' })
      if (reduced) {
        gsap.set(panel, { xPercent: 0 })
        gsap.set(scrim, { opacity: 1 })
        return
      }
      gsap.to(scrim, { opacity: 1, duration: DUR.base, ease: EASE.expo })
      gsap.to(panel, { xPercent: 0, duration: DUR.base, ease: EASE.expo })
      return
    }

    // First run on mount: nothing to animate out, just stay hidden.
    if (!hasOpenedRef.current || reduced) {
      gsap.set(panel, { xPercent: 100 })
      gsap.set(scrim, { opacity: 0 })
      gsap.set(root, { visibility: 'hidden' })
      return
    }

    gsap.to(scrim, { opacity: 0, duration: DUR.base, ease: EASE.expo })
    gsap.to(panel, { xPercent: 100, duration: DUR.base, ease: EASE.expo })

    // Deliberately a timer rather than the tween's onComplete: GSAP's ticker is
    // rAF-driven and stalls in a backgrounded tab, which would leave the drawer
    // stuck at `visibility: visible` forever. The tween is decoration; taking
    // the panel out of the layer must not depend on frames being served.
    hideTimerRef.current = window.setTimeout(
      () => gsap.set(root, { visibility: 'hidden' }),
      DUR.base * 1000,
    )

    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [isOpen, reduced])

  // Focus handover. On open, remember what was focused and move focus into the
  // panel; on close, put it back. `inert` on the root (below) keeps the closing
  // panel out of the tab order while it slides away.
  useEffect(() => {
    if (isOpen) {
      const active = document.activeElement
      returnFocusRef.current =
        active instanceof HTMLElement && active !== document.body ? active : null
      panelRef.current?.focus()
      return
    }

    if (!hasOpenedRef.current) return

    const previous = returnFocusRef.current
    returnFocusRef.current = null
    if (previous?.isConnected) {
      previous.focus()
      return
    }
    // Safari does not focus a button on click, so the captured element can be
    // nothing useful; fall back to the nav cart button that owns the drawer.
    document.querySelector<HTMLElement>('[data-cart-button]')?.focus()
  }, [isOpen])

  // Escape closes; Tab is trapped inside the panel by wrapping at both ends.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      const nodes = focusableWithin(panel)
      if (nodes.length === 0) {
        event.preventDefault()
        panel?.focus()
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      // Membership in `nodes`, not `panel.contains`: the panel itself is
      // focusable via tabIndex={-1} but is not a tab stop, so tabbing from it
      // must land on a real end of the list rather than fall through.
      const inside = active instanceof HTMLElement && nodes.includes(active)

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault()
          last.focus()
        }
        return
      }
      if (!inside || active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const setRowRef = (key: string) => (el: HTMLLIElement | null) => {
    if (el) rowRefs.current.set(key, el)
    else rowRefs.current.delete(key)
  }

  // Collapses the row before the store drops it, so the lines below rise into
  // the gap instead of jumping.
  const handleRemove = (key: string) => {
    const row = rowRefs.current.get(key)
    if (!row || reduced) {
      remove(key)
      return
    }
    gsap.to(row, {
      height: 0,
      opacity: 0,
      x: 32,
      paddingTop: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
      duration: DUR.fast,
      ease: EASE.power,
    })
    // Same reasoning as the close timer: the store update is on the clock, not
    // on the tween's onComplete, so a stalled ticker can never strand a line
    // the user has already removed.
    window.setTimeout(() => remove(key), DUR.fast * 1000)
  }

  // Stripe seam: replace this handler with a POST to /api/checkout that creates
  // a Stripe Checkout session and redirects to session.url.
  const onCheckout = () => setNotice('Checkout opens soon. Your cart is saved.')

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[90]"
      style={{ visibility: 'hidden' }}
      inert={!isOpen}
      aria-hidden={!isOpen}
    >
      <button
        ref={scrimRef}
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-void/60 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ink outline-none"
        style={{ transform: 'translateX(100%)' }}
      >
        <header className="flex items-center justify-between gap-6 border-b border-bone/10 px-6 py-6">
          <h2 id="cart-drawer-title" className="eyebrow">
            Cart {count > 0 ? `— ${count}` : ''}
          </h2>
          <button
            type="button"
            data-cursor
            aria-label="Close cart"
            onClick={handleClose}
            className="eyebrow border border-bone/20 px-3 py-2 text-bone/70 outline-none transition-colors hover:border-bone/50 hover:text-bone focus-visible:ring-1 focus-visible:ring-crema"
            style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
          >
            Close
          </button>
        </header>

        {visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="eyebrow">Your cart is empty</p>
            <Link
              href="/shop"
              data-cursor
              onClick={handleClose}
              className="border-b border-crema pb-1 text-sm uppercase tracking-[0.14em] text-crema outline-none focus-visible:ring-1 focus-visible:ring-crema"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            {/* data-lenis-prevent: Lenis swallows wheel events globally, so the
                drawer's own scroll container has to opt out of smooth scroll. */}
            <ul className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
              {visible.map((line) => {
                const key = lineKey(line)
                const image = getProduct(line.slug)?.image
                return (
                  <li
                    key={key}
                    ref={setRowRef(key)}
                    className="flex gap-5 overflow-hidden border-b border-bone/10 py-6"
                  >
                    <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-void">
                      {image && (
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="display truncate text-2xl text-bone">{line.name}</h3>
                        <span className="shrink-0 text-sm tabular-nums text-bone/80">
                          {formatUSD(linePrice(line))}
                        </span>
                      </div>

                      <p className="text-xs text-ash">{summarise(line)}</p>

                      <div className="mt-1 flex items-center justify-between gap-4">
                        <div className="flex items-center border border-bone/15">
                          <button
                            type="button"
                            data-cursor
                            aria-label={`Decrease quantity of ${line.name}`}
                            disabled={line.qty <= 1}
                            onClick={() => setQty(key, line.qty - 1)}
                            className="px-3 py-2 text-bone/80 outline-none transition-colors hover:text-bone focus-visible:ring-1 focus-visible:ring-crema disabled:opacity-30"
                            style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
                          >
                            &minus;
                          </button>
                          <span className="min-w-8 text-center text-sm tabular-nums text-bone">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            data-cursor
                            aria-label={`Increase quantity of ${line.name}`}
                            disabled={line.qty >= MAX_QTY}
                            onClick={() => setQty(key, line.qty + 1)}
                            className="px-3 py-2 text-bone/80 outline-none transition-colors hover:text-bone focus-visible:ring-1 focus-visible:ring-crema disabled:opacity-30"
                            style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          data-cursor
                          aria-label={`Remove ${line.name} from cart`}
                          onClick={() => handleRemove(key)}
                          className="eyebrow outline-none transition-colors hover:text-bone focus-visible:ring-1 focus-visible:ring-crema"
                          style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <footer className="border-t border-bone/10 px-6 py-6">
              <div className="flex items-baseline justify-between gap-6">
                <span className="eyebrow">Subtotal</span>
                <span className="display text-3xl tabular-nums text-bone">
                  {formatUSD(subtotal(visible))}
                </span>
              </div>

              <p className="mt-3 text-xs text-ash">Shipping and taxes calculated at checkout.</p>

              <button
                type="button"
                data-cursor
                onClick={onCheckout}
                className="mt-6 w-full border border-crema bg-crema px-8 py-4 text-sm uppercase tracking-[0.18em] text-void outline-none transition-colors hover:bg-transparent hover:text-crema focus-visible:ring-1 focus-visible:ring-crema"
                style={{ transitionDuration: reduced ? '0s' : `${DUR.fast}s` }}
              >
                Checkout
              </button>

              <p aria-live="polite" className="eyebrow mt-4 h-4">
                {notice}
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
