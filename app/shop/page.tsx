import type { Metadata } from 'next'
import Reveal from '@/components/scroll/Reveal'
import { columnOffset } from '@/components/sections/Collection'
import ProductCard from '@/components/shop/ProductCard'
import { stagger } from '@/lib/motion'
import { PRODUCTS } from '@/lib/products'

export function generateMetadata(): Metadata {
  return {
    title: 'Shop — Noir',
    description:
      'Six single origins, roasted to the edge and never past it. Shipped within four days of the roast.',
  }
}

export default function ShopPage() {
  return (
    <main className="w-full bg-void px-6 pb-32 pt-40 md:px-10 md:pb-48 md:pt-52">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="eyebrow block">The Collection</span>
          <h1
            className="display mt-6 max-w-[14ch] text-bone"
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}
          >
            Everything we roast
          </h1>
        </Reveal>

        <Reveal delay={stagger(2)}>
          <p className="mt-10 max-w-[46ch] text-sm leading-relaxed text-ash">
            Six origins, each held for one season only. Every bag is roasted to order and
            leaves the atelier within four days of the drop.
          </p>
        </Reveal>

        <div className="mt-24 grid gap-x-8 gap-y-20 md:mt-32 md:grid-cols-3 md:pt-12">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.slug} delay={stagger(i % 3)} className={columnOffset(i)}>
              <ProductCard product={product} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
