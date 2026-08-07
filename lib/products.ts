export type Product = {
  slug: string
  name: string
  origin: string
  altitude: string
  process: string
  roast: 1 | 2 | 3 | 4 | 5
  notes: [string, string, string]
  price: number
  blurb: string
  image: string
}

export const PRODUCTS: Product[] = [
  {
    slug: 'aurora',
    name: 'Aurora',
    origin: 'Yirgacheffe, Ethiopia',
    altitude: '1,950 – 2,200m',
    process: 'Natural',
    roast: 1,
    notes: ['Bergamot', 'White peach', 'Jasmine'],
    price: 32,
    blurb:
      'Picked at the top of the escarpment and dried on raised beds for eighteen days. The lightest roast we will put our name to.',
    image: '/images/product-aurora.jpg',
  },
  {
    slug: 'meridian',
    name: 'Meridian',
    origin: 'Huila, Colombia',
    altitude: '1,700 – 1,900m',
    process: 'Washed',
    roast: 2,
    notes: ['Red apple', 'Honey', 'Black tea'],
    price: 28,
    blurb:
      'Grown on a single hillside above the Río Cofres and washed within hours of picking. Balanced, quiet, built for every morning.',
    image: '/images/product-meridian.jpg',
  },
  {
    slug: 'ember',
    name: 'Ember',
    origin: 'Cerrado Mineiro, Brazil',
    altitude: '1,000 – 1,200m',
    process: 'Natural',
    roast: 3,
    notes: ['Hazelnut', 'Brown sugar', 'Dried fig'],
    price: 26,
    blurb:
      'Sun-dried on the farm for three weeks until the cherries turn to raisin. Round, warm, built to sit under milk.',
    image: '/images/product-ember.jpg',
  },
  {
    slug: 'atlas',
    name: 'Atlas',
    origin: 'Huehuetenango, Guatemala',
    altitude: '1,500 – 1,700m',
    process: 'Washed',
    roast: 3,
    notes: ['Toasted almond', 'Orange zest', 'Caramel'],
    price: 22,
    blurb:
      'A high-altitude lot from smallholders above the Cuchumatanes, washed and dried on open patios. The one we keep in the kitchen.',
    image: '/images/product-atlas.jpg',
  },
  {
    slug: 'obsidian',
    name: 'Obsidian',
    origin: 'Gayo Highlands, Sumatra',
    altitude: '1,200 – 1,500m',
    process: 'Wet-hulled',
    roast: 4,
    notes: ['Dark chocolate', 'Cedar', 'Black cherry'],
    price: 34,
    blurb:
      'Wet-hulled overnight the way it has been done in Aceh for a hundred years. Heavy in the cup, longer in the finish.',
    image: '/images/product-obsidian.jpg',
  },
  {
    slug: 'midnight-oil',
    name: 'Midnight Oil',
    origin: 'Malabar Coast, India',
    altitude: '900 – 1,100m',
    process: 'Monsooned',
    roast: 5,
    notes: ['Molasses', 'Tobacco', 'Bittersweet cocoa'],
    price: 38,
    blurb:
      'Rested on open decks through the monsoon winds until the beans swell and turn gold. The darkest roast we make, and the last one before bed.',
    image: '/images/product-midnight-oil.jpg',
  },
]

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}
