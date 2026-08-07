import type { Metadata } from 'next'
import ContactForm from '@/components/sections/ContactForm'
import Reveal from '@/components/scroll/Reveal'
import { stagger } from '@/lib/motion'

export const metadata: Metadata = {
  title: 'Contact — Noir',
  description:
    'Write to Noir: wholesale, press, or subscriptions. We answer within two days.',
}

const HOURS = [
  { day: 'Monday — Friday', time: '8:00 — 17:00' },
  { day: 'Saturday', time: '9:00 — 14:00' },
  { day: 'Sunday', time: 'Closed' },
]

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="relative flex min-h-screen w-full flex-col bg-void px-6 pb-24 pt-40 md:px-10 md:pb-32">
      <div className="mx-auto grid w-full max-w-7xl gap-16 md:grid-cols-2 md:gap-10">
        <div>
          <Reveal>
            <span className="eyebrow block">Get in touch</span>
          </Reveal>
          <Reveal delay={stagger(2)}>
            <h1
              className="display mt-6 max-w-[12ch] text-bone"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
            >
              Write to the atelier.
            </h1>
          </Reveal>

          <Reveal delay={stagger(4)}>
            <div className="mt-16 flex flex-col gap-12">
              <div>
                <span className="eyebrow block">Email</span>
                <a
                  href="mailto:hello@noir.coffee"
                  data-cursor
                  className="display mt-3 inline-block text-2xl text-crema outline-none focus-visible:ring-1 focus-visible:ring-crema md:text-3xl"
                >
                  hello@noir.coffee
                </a>
              </div>

              <div>
                <span className="eyebrow block">Roastery</span>
                <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-ash">
                  Noir Coffee Roasters
                  <br />
                  14 Kiln Street, Unit 3
                  <br />
                  Brooklyn, NY 11211
                </p>
              </div>

              <div>
                <span className="eyebrow block">Hours</span>
                <dl className="mt-3 flex flex-col gap-1.5">
                  {HOURS.map((row) => (
                    <div key={row.day} className="flex justify-between gap-6 text-sm text-ash">
                      <dt>{row.day}</dt>
                      <dd className="tabular-nums text-bone/80">{row.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={stagger(3)}>
          <ContactForm />
        </Reveal>
      </div>
    </main>
  )
}
