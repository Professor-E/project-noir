'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type CartLine, lineKey, subtotal } from './cart-math'

type CartState = {
  lines: CartLine[]
  isOpen: boolean
  add: (line: CartLine) => void
  remove: (key: string) => void
  setQty: (key: string, qty: number) => void
  toggle: () => void
  close: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line) =>
        set((state) => {
          const key = lineKey(line)
          const existing = state.lines.find((l) => lineKey(l) === key)
          const lines = existing
            ? state.lines.map((l) =>
                lineKey(l) === key ? { ...l, qty: l.qty + line.qty } : l,
              )
            : [...state.lines, line]
          return { lines, isOpen: true }
        }),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => lineKey(l) !== key) })),
      setQty: (key, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => lineKey(l) !== key)
              : state.lines.map((l) => (lineKey(l) === key ? { ...l, qty } : l)),
        })),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'noir-cart',
      partialize: (state) => ({ lines: state.lines }),
      // A corrupt or outdated payload resets to an empty cart rather than throwing.
      merge: (persisted, current) => {
        const lines = (persisted as { lines?: unknown })?.lines
        return { ...current, lines: Array.isArray(lines) ? (lines as CartLine[]) : [] }
      },
    },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0)
export { subtotal }
