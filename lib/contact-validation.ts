export type ContactInput = {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactResult =
  | { ok: true; data: ContactInput }
  | { ok: false; errors: Record<string, string> }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact(input: unknown): ContactResult {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: { form: 'Invalid submission.' } }
  }

  const raw = input as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  const data: ContactInput = {
    name: str(raw.name),
    email: str(raw.email),
    subject: str(raw.subject) || 'General',
    message: str(raw.message),
  }

  const errors: Record<string, string> = {}
  if (!data.name) errors.name = 'Tell us your name.'
  if (!EMAIL.test(data.email)) errors.email = 'That email does not look right.'
  if (data.message.length < 10) errors.message = 'A little more detail, please.'

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data }
}
