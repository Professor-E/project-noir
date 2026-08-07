/**
 * Ref-counted body scroll lock.
 *
 * Three independent owners want the page frozen — the preloader curtain, the
 * mobile menu, and the cart drawer — and their lifetimes overlap. Writing
 * `document.body.style.overflow` directly means whoever releases last wins:
 * React flushes sibling effects in tree order, so Nav's mount effect (menu
 * closed) used to clear the lock the Preloader had just taken. Counting the
 * holders instead means the body only unlocks when nobody is holding it.
 */
let holders = 0

export function lock(): void {
  holders += 1
  if (holders === 1) document.body.style.overflow = 'hidden'
}

export function unlock(): void {
  if (holders === 0) return
  holders -= 1
  if (holders === 0) document.body.style.overflow = ''
}
