import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/scroll/Reveal'
import { stagger } from '@/lib/motion'

export default function CollectionTeaser() {
  return (
    <section
      id="collection"
      aria-labelledby="collection-heading"
      className="relative w-full overflow-hidden bg-void"
    >
      <div className="relative aspect-[4/3] w-full md:aspect-[21/9]">
        <Image
          src="/images/atelier-2.jpg"
          alt="Roasted beans cooling in the atelier"
          fill
          sizes="100vw"
          className="object-cover brightness-75"
          priority={false}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/30"
        />

        <div className="absolute inset-0 flex items-end px-6 py-16 md:px-10 md:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <Reveal>
              <span className="eyebrow block">The Collection</span>
              <h2
                id="collection-heading"
                className="display mt-6 max-w-[16ch] text-bone"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', lineHeight: 1.15 }}
              >
                Six origins, one obsession
              </h2>
            </Reveal>

            <Reveal delay={stagger(1)}>
              <p className="mt-8 max-w-[46ch] text-sm leading-relaxed text-bone/85">
                Each held for one season only, roasted to order, gone within four days of the
                drop.
              </p>

              <Link
                href="/shop"
                data-cursor
                className="relative z-[210] mt-10 inline-flex items-center gap-3 border-b border-crema/40 pb-2 text-sm text-crema transition-colors hover:border-crema"
              >
                Shop the collection
                <span aria-hidden>&rarr;</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
