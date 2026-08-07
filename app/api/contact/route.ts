import { NextResponse } from 'next/server'
import { validateContact } from '@/lib/contact-validation'

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Invalid JSON.' } }, { status: 400 })
  }

  const result = validateContact(payload)
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 })
  }

  // Email seam: send result.data via Resend or Formspree here.
  console.log('[noir:contact]', result.data)

  return NextResponse.json({ ok: true })
}
