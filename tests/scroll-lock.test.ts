import { beforeEach, describe, expect, it, vi } from 'vitest'

// The suite runs in the `node` environment, and the lock only ever touches one
// property, so a two-line stand-in for `document` is enough — no DOM needed.
const style = { overflow: '' }
;(globalThis as unknown as { document: unknown }).document = { body: { style } }

/** Re-imports the module so its holder counter starts at 0 for each case. */
async function freshLock() {
  vi.resetModules()
  return import('@/lib/scroll-lock')
}

describe('scroll-lock', () => {
  beforeEach(() => {
    style.overflow = ''
  })

  it('locks on the 0 to 1 edge and unlocks only on the 1 to 0 edge', async () => {
    const { lock, unlock } = await freshLock()

    lock()
    expect(style.overflow).toBe('hidden')

    lock()
    unlock()
    // A second holder is still holding: the body stays locked.
    expect(style.overflow).toBe('hidden')

    unlock()
    expect(style.overflow).toBe('')
  })

  it('clamps at zero so a stray unlock cannot go negative', async () => {
    const { lock, unlock } = await freshLock()

    unlock()
    unlock()
    expect(style.overflow).toBe('')

    lock()
    expect(style.overflow).toBe('hidden')
    unlock()
    expect(style.overflow).toBe('')
  })
})
