import Reveal from '@/components/scroll/Reveal'
import ProductCard from '@/components/shop/ProductCard'
import { stagger } from '@/lib/motion'
import { PRODUCTS } from '@/lib/products'

// Kept for callers that still import it; cards now sit on one straight grid
// with no per-column offset.
export function columnOffset(_index: number): string {
  return ''
}

export default function Collection() {
  return (
    <section
      id="collection"
      aria-labelledby="collection-heading"
      className="relative w-full bg-void px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-7xl">
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

        <div className="mt-24 grid gap-x-8 gap-y-20 md:grid-cols-3 md:pt-12">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.slug} delay={stagger(i % 3)} className={columnOffset(i)}>
              <ProductCard product={product} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
