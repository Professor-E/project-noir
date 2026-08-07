import { describe, expect, it } from 'vitest'
import { validateContact } from '@/lib/contact-validation'

const valid = {
  name: 'Dominik',
  email: 'd@example.com',
  subject: 'Wholesale',
  message: 'I would like to stock Noir in my cafe.',
}

describe('validateContact', () => {
  it('accepts a complete submission', () => {
    const result = validateContact(valid)
    expect(result.ok).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = validateContact({ ...valid, name: '  ' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.name).toBeTruthy()
  })

  it('rejects a malformed email', () => {
    const result = validateContact({ ...valid, email: 'nope' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.email).toBeTruthy()
  })

  it('rejects a message under 10 characters', () => {
    const result = validateContact({ ...valid, message: 'hi' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.message).toBeTruthy()
  })

  it('rejects a non-object payload', () => {
    expect(validateContact(null).ok).toBe(false)
    expect(validateContact('nope').ok).toBe(false)
  })

  it('trims accepted values', () => {
    const result = validateContact({ ...valid, name: '  Dominik  ' })
    if (result.ok) expect(result.data.name).toBe('Dominik')
  })
})
