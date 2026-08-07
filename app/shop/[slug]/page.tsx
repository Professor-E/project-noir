import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Reveal from '@/components/scroll/Reveal'
import AddToCart from '@/components/shop/AddToCart'
import ProductCard from '@/components/shop/ProductCard'
import BagCanvas from '@/components/three/BagCanvas'
import { stagger } from '@/lib/motion'
import { PRODUCTS, getProduct, type Product } from '@/lib/products'

type Params = { params: Promise<{ slug: string }> }

const ROAST_LABELS = ['Light', 'Medium light', 'Medium', 'Medium dark', 'Dark']

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: 'Not found — Noir' }
  return {
    title: `${product.name} — Noir`,
    description: product.blurb,
  }
}

function RoastTicks({ roast }: { roast: number }) {
  return (
    <span className="flex items-center gap-4">
      <span aria-hidden className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((tick) => (
          <span
            key={tick}
            className={`block h-3.5 w-0.5 ${tick <= roast ? 'bg-crema' : 'bg-ash/40'}`}
          />
        ))}
      </span>
      <span className="text-bone/80">{ROAST_LABELS[roast - 1]}</span>
    </span>
  )
}

function SpecRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-8 border-b border-bone/10 py-5">
      <dt className="eyebrow">{term}</dt>
      <dd className="text-right text-sm text-bone/85">{children}</dd>
    </div>
  )
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product: Product | undefined = getProduct(slug)
  if (!product) notFound()

  const others = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3)

  return (
    <main id="main" tabIndex={-1} className="w-full bg-void px-6 pb-32 pt-32 md:px-10 md:pb-48 md:pt-36">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/shop"
          data-cursor
          className="eyebrow inline-flex items-center gap-3 text-ash transition-colors hover:text-bone"
        >
          <span aria-hidden>&larr;</span>
          All coffee
        </Link>

        <div className="mt-10 grid gap-20 md:grid-cols-2 md:items-start md:gap-16">
          {/* The bag holds the left column while the detail scrolls past it. */}
          <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:py-20">
            <div className="h-[60vh] w-full md:h-full">
              <BagCanvas roast={product.roast} name={product.name} image={product.image} />
            </div>
            <p className="eyebrow mt-5 text-center">Drag to rotate</p>
          </div>

          <div className="md:pb-24 md:pt-20">
            <Reveal>
              <span className="eyebrow block">{product.origin}</span>
              <h1
                className="display mt-6 text-bone"
                style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
              >
                {product.name}
              </h1>
              <p className="mt-6 text-sm tabular-nums text-crema">
                ${product.price} · 250g
              </p>
            </Reveal>

            <Reveal delay={stagger(2)}>
              <dl className="mt-14 border-t border-bone/10">
                <SpecRow term="Origin">{product.origin}</SpecRow>
                <SpecRow term="Altitude">{product.altitude}</SpecRow>
                <SpecRow term="Process">{product.process}</SpecRow>
                <SpecRow term="Roast">
                  <RoastTicks roast={product.roast} />
                </SpecRow>
              </dl>
            </Reveal>

            <Reveal delay={stagger(3)}>
              <div className="mt-16">
                <span className="eyebrow block">In the cup</span>
                <ul className="mt-6">
                  {product.notes.map((note) => (
                    <li
                      key={note}
                      className="display border-b border-bone/10 py-5 text-4xl text-bone md:text-5xl"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={stagger(4)}>
              <p className="mt-14 max-w-[46ch] text-sm leading-relaxed text-ash">
                {product.blurb}
              </p>
            </Reveal>

            <AddToCart product={product} />
          </div>
        </div>

        <section aria-labelledby="more-heading" className="mt-40 md:mt-56">
          <Reveal>
            <h2 id="more-heading" className="display text-bone" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              More from Noir
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-x-8 gap-y-20 md:grid-cols-3">
            {others.map((other, i) => (
              <Reveal key={other.slug} delay={stagger(i)}>
                <ProductCard
                  product={other}
                  index={PRODUCTS.findIndex((p) => p.slug === other.slug)}
                />
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
