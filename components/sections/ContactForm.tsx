'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { validateContact, type ContactInput } from '@/lib/contact-validation'
import { DUR, EASE, prefersReducedMotion, stagger } from '@/lib/motion'

type Status = 'idle' | 'submitting'

const SUBJECTS = ['General', 'Wholesale', 'Press', 'Subscriptions'] as const

const EMPTY_VALUES: ContactInput = { name: '', email: '', subject: 'General', message: '' }

function transitionStyle(reduced: boolean) {
  return {
    transitionDuration: reduced ? '0s' : `${DUR.fast}s`,
    transitionTimingFunction: EASE.smooth,
  }
}

/** Shared underline rule: sits under every field, animates to full width on focus. */
function FocusRule({ reduced }: { reduced: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-0 bg-crema transition-[width] peer-focus:w-full"
      style={transitionStyle(reduced)}
    />
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <span id={id} role={message ? 'alert' : undefined} className="mt-2 block min-h-[1rem] text-xs text-crema">
      {message ?? ''}
    </span>
  )
}

const fieldClass =
  'peer block w-full border-0 border-b border-bone/20 bg-transparent py-3 text-bone outline-none placeholder:text-ash/70 focus:border-transparent'

function TextField({
  id,
  label,
  name,
  type = 'text',
  value,
  error,
  reduced,
  onChange,
}: {
  id: string
  label: string
  name: keyof ContactInput
  type?: string
  value: string
  error?: string
  reduced: boolean
  onChange: (name: keyof ContactInput, value: string) => void
}) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      <span className="relative mt-3 block">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          autoComplete={type === 'email' ? 'email' : 'name'}
          aria-invalid={!!error}
          aria-describedby={errorId}
          onChange={(e) => onChange(name, e.target.value)}
          className={fieldClass}
        />
        <FocusRule reduced={reduced} />
      </span>
      <FieldError id={errorId} message={error} />
    </div>
  )
}

function SelectField({
  id,
  label,
  name,
  value,
  reduced,
  onChange,
}: {
  id: string
  label: string
  name: keyof ContactInput
  value: string
  reduced: boolean
  onChange: (name: keyof ContactInput, value: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      <span className="relative mt-3 block">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${fieldClass} appearance-none pr-8`}
        >
          {SUBJECTS.map((option) => (
            <option key={option} value={option} className="bg-ink text-bone">
              {option}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ash">
          &darr;
        </span>
        <FocusRule reduced={reduced} />
      </span>
    </div>
  )
}

function TextAreaField({
  id,
  label,
  name,
  value,
  error,
  reduced,
  onChange,
}: {
  id: string
  label: string
  name: keyof ContactInput
  value: string
  error?: string
  reduced: boolean
  onChange: (name: keyof ContactInput, value: string) => void
}) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      <span className="relative mt-3 block">
        <textarea
          id={id}
          name={name}
          value={value}
          rows={5}
          aria-invalid={!!error}
          aria-describedby={errorId}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${fieldClass} resize-none`}
        />
        <FocusRule reduced={reduced} />
      </span>
      <FieldError id={errorId} message={error} />
    </div>
  )
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY_VALUES)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [submitted, setSubmitted] = useState(false)
  const [reduced, setReduced] = useState(false)

  const formWrapRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLParagraphElement>(null)
  const hasSubmittedRef = useRef(false)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
  }, [])

  // Normalises the success line's GSAP-driven state to match its inline
  // server-rendered start (hidden), mirroring CartDrawer's mount-time set.
  useEffect(() => {
    gsap.set(successRef.current, { autoAlpha: 0, y: 16 })
  }, [])

  useEffect(() => {
    const form = formWrapRef.current
    const success = successRef.current
    if (!form || !success) return

    if (!submitted) return
    hasSubmittedRef.current = true

    gsap.killTweensOf([form, success])

    if (reduced) {
      gsap.set(form, { autoAlpha: 0 })
      gsap.set(success, { autoAlpha: 1, y: 0 })
      return
    }

    gsap.to(form, { opacity: 0, y: -24, duration: DUR.base, ease: EASE.smooth })
    gsap.to(success, {
      autoAlpha: 1,
      y: 0,
      duration: DUR.base,
      delay: stagger(2),
      ease: EASE.smooth,
    })

    // Timer, not the tween's onComplete: a backgrounded tab stalls GSAP's
    // rAF ticker, and the form must still be taken out of the tab order
    // even if no frame ever fires to report completion.
    hideTimerRef.current = window.setTimeout(
      () => gsap.set(form, { visibility: 'hidden' }),
      DUR.base * 1000,
    )

    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [submitted, reduced])

  function update(name: keyof ContactInput, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (status === 'submitting') return

    const result = validateContact(values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })
      const json: { ok: boolean; errors?: Record<string, string> } | null = await response
        .json()
        .catch(() => null)

      if (response.ok && json?.ok) {
        setStatus('idle')
        setSubmitted(true)
        return
      }

      setErrors(json?.errors ?? { form: 'Something went wrong. Try again.' })
      setStatus('idle')
    } catch {
      setErrors({ form: 'Something went wrong. Try again.' })
      setStatus('idle')
    }
  }

  return (
    <div className="relative">
      <div ref={formWrapRef} style={{ pointerEvents: submitted ? 'none' : 'auto' }} inert={submitted}>
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
          <TextField
            id="contact-name"
            label="Name"
            name="name"
            value={values.name}
            error={errors.name}
            reduced={reduced}
            onChange={update}
          />
          <TextField
            id="contact-email"
            label="Email"
            name="email"
            type="email"
            value={values.email}
            error={errors.email}
            reduced={reduced}
            onChange={update}
          />
          <SelectField
            id="contact-subject"
            label="Subject"
            name="subject"
            value={values.subject}
            reduced={reduced}
            onChange={update}
          />
          <TextAreaField
            id="contact-message"
            label="Message"
            name="message"
            value={values.message}
            error={errors.message}
            reduced={reduced}
            onChange={update}
          />

          <p aria-live="assertive" className="min-h-[1rem] text-sm text-crema">
            {errors.form ?? ''}
          </p>

          <button
            type="submit"
            data-cursor
            disabled={status === 'submitting'}
            className="inline-flex w-full items-center justify-center gap-4 border border-crema bg-crema px-10 py-5 text-sm uppercase tracking-[0.18em] text-void outline-none transition-colors hover:bg-transparent hover:text-crema focus-visible:ring-1 focus-visible:ring-crema disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            style={transitionStyle(reduced)}
          >
            {status === 'submitting' ? 'Sending' : 'Send message'}
          </button>
        </form>
      </div>

      <p
        ref={successRef}
        aria-live="polite"
        className="display absolute inset-0 flex items-center text-3xl text-bone md:text-4xl"
      >
        {submitted ? 'Thank you. We will write back within two days.' : ''}
      </p>
    </div>
  )
}
