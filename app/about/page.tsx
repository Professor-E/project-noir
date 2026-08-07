import type { Metadata } from 'next'
import Image from 'next/image'
import Reveal from '@/components/scroll/Reveal'
import Timeline, { type TimelineEntry } from '@/components/sections/Timeline'
import { stagger } from '@/lib/motion'

export function generateMetadata(): Metadata {
  return {
    title: 'About — Noir',
    description:
      'Noir since 2019: one drum, direct-trade relationships, a cold extraction programme, and the six origins we roast today.',
  }
}

const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    year: '2019',
    title: 'The first roast',
    body: 'A twelve-kilo drum in a rented unit and a single lot from Huila. We logged every batch by hand because we did not yet trust ourselves not to forget.',
    image: '/images/atelier-2.jpg',
  },
  {
    year: '2021',
    title: 'Direct to Yirgacheffe',
    body: 'We stopped buying through importers and started flying to Ethiopia ourselves. Four washing stations, bought lot by lot, visited every harvest since.',
    image: '/images/bean-light.jpg',
  },
  {
    year: '2023',
    title: 'The cold extraction programme',
    body: 'Twenty-two hours, no heat, no shortcuts. It took eleven months of failed batches before the first bottle left the atelier.',
    image: '/images/atelier-3.jpg',
  },
  {
    year: '2026',
    title: 'Six origins, one obsession',
    body: 'The range as it stands today: six single origins, each held for one season only, roasted to order and shipped within four days.',
    image: '/images/product-atlas.jpg',
  },
]

const ETHOS = [
  {
    index: '01',
    title: 'Direct trade',
    body: 'We buy from the farms and washing stations ourselves, every harvest, with no importer standing between us and the grower.',
  },
  {
    index: '02',
    title: 'Paid before it ships',
    body: 'Every lot is paid above the Fair Trade floor, in full, before the container leaves port. Not on consignment, not on delivery.',
  },
  {
    index: '03',
    title: 'One season, then retired',
    body: 'Each origin is held for a single season and then it is gone. Nothing is blended to stretch a bad harvest into a good one.',
  },
]

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1}>
      <section
        aria-labelledby="about-heading"
        className="relative flex min-h-screen w-full items-end overflow-hidden bg-void px-6 pb-20 pt-40 md:px-10 md:pb-28"
      >
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/images/atelier-1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-void via-void/55 to-void/15" />
        </div>

        <div className="relative z-10 max-w-5xl">
          <Reveal>
            <span className="eyebrow block">About Noir</span>
          </Reveal>
          <Reveal delay={stagger(2)}>
            <h1
              id="about-heading"
              className="display mt-6 text-bone"
              style={{ fontSize: 'clamp(3rem, 10vw, 8.5rem)' }}
            >
              The dark was never the obstacle. It was the method.
            </h1>
          </Reveal>
        </div>
      </section>

      <Timeline entries={TIMELINE_ENTRIES} />

      <section
        aria-labelledby="ethos-heading"
        className="relative w-full bg-void px-6 py-32 md:px-10 md:py-48"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <span className="eyebrow block">Sourcing</span>
            <h2
              id="ethos-heading"
              className="display mt-6 max-w-[16ch] text-bone"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              How we buy
            </h2>
          </Reveal>

          <div className="mt-20 grid gap-x-10 gap-y-16 md:mt-28 md:grid-cols-3">
            {ETHOS.map((item, i) => (
              <Reveal key={item.title} delay={stagger(i)}>
                <span className="eyebrow block text-crema">{item.index}</span>
                <h3 className="display mt-5 text-3xl text-bone md:text-4xl">{item.title}</h3>
                <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-ash">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="quote-heading"
        className="relative flex w-full items-center justify-center bg-void px-6 py-32 md:px-10 md:py-48"
      >
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p
              id="quote-heading"
              className="display text-bone"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1.15 }}
            >
              &ldquo;The bean doesn&rsquo;t lie. Rush it, and it tells you.&rdquo;
            </p>
          </Reveal>
          <Reveal delay={stagger(2)}>
            <span className="eyebrow mt-10 block">— Noir Roast Log, Entry 214</span>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
