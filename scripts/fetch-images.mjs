// Downloads the curated Noir photography set from Unsplash into public/images,
// then writes/updates docs/credits.md with a Photography section.
// Usage: node scripts/fetch-images.mjs
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve('public/images')
const CREDITS_PATH = path.resolve('docs/credits.md')

// Direct Unsplash CDN URLs, all photo IDs verified reachable (HTTP 200, real JPEG)
// via curl before this script was finalized. Every entry shares a dark, warm,
// cinematic grade (espresso/dark studio surfaces, shadowed beans, dim roastery
// interiors, moody highland/farm landscapes) so the set reads as one shoot.
const IMAGES = [
  // Product shots (espresso pours / dark studio compositions) — back the six
  // product pages since there is no real packaging to photograph.
  {
    file: 'product-aurora.jpg',
    url: 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=1800&q=80&fm=jpg',
    credit: 'Photo by Cphotos on Unsplash — https://unsplash.com/photos/8blVdQB0hoI',
  },
  {
    file: 'product-meridian.jpg',
    url: 'https://images.unsplash.com/photo-1615464637805-16154b4d5ea1?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1615464637805-16154b4d5ea1',
  },
  {
    file: 'product-obsidian.jpg',
    url: 'https://images.unsplash.com/photo-1625608343997-d53dca75aa09?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1625608343997-d53dca75aa09',
  },
  {
    file: 'product-ember.jpg',
    url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1510591509098-f4fdc6d0ff04',
  },
  {
    file: 'product-midnight-oil.jpg',
    url: 'https://images.unsplash.com/photo-1596952954288-16862d37405b?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1596952954288-16862d37405b',
  },
  {
    file: 'product-atlas.jpg',
    url: 'https://images.unsplash.com/photo-1704985181792-8006d9086eaf?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1704985181792-8006d9086eaf',
  },

  // Roast-stage bean macro shots, light -> dark.
  {
    file: 'bean-light.jpg',
    url: 'https://images.unsplash.com/photo-1712143525667-717b146a141f?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1712143525667-717b146a141f',
  },
  {
    file: 'bean-medium.jpg',
    url: 'https://images.unsplash.com/photo-1624258247141-0d28b2f5b6d2?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1624258247141-0d28b2f5b6d2',
  },
  {
    file: 'bean-dark.jpg',
    url: 'https://images.unsplash.com/photo-1628236876894-dbde8ff5a944?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1628236876894-dbde8ff5a944',
  },

  // Roastery / atelier interiors.
  {
    file: 'atelier-1.jpg',
    url: 'https://images.unsplash.com/photo-1655182404825-d088887fa132?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1655182404825-d088887fa132',
  },
  {
    file: 'atelier-2.jpg',
    url: 'https://images.unsplash.com/photo-1645677020082-721a854c24f2?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1645677020082-721a854c24f2',
  },
  {
    file: 'atelier-3.jpg',
    url: 'https://images.unsplash.com/photo-1652212159777-b3b98d40adab?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1652212159777-b3b98d40adab',
  },

  // Origin / farm landscapes.
  {
    file: 'origin-ethiopia.jpg',
    url: 'https://images.unsplash.com/photo-1572888195250-3037a59d3578?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1572888195250-3037a59d3578',
  },
  {
    file: 'origin-colombia.jpg',
    url: 'https://images.unsplash.com/photo-1646438596321-5cded1891b62?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1646438596321-5cded1891b62',
  },
  {
    file: 'origin-sumatra.jpg',
    url: 'https://images.unsplash.com/photo-1592194257036-996a8d58d8f8?w=1800&q=80&fm=jpg',
    credit: 'Photo on Unsplash — https://unsplash.com/photos/photo-1592194257036-996a8d58d8f8',
  },
]

async function downloadOne({ file, url }) {
  const dest = path.join(OUT_DIR, file)
  const res = await fetch(url, { headers: { 'User-Agent': 'noir-site-fetch-images/1.0' } })
  if (!res.ok) {
    throw new Error(`${file}: HTTP ${res.status} for ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
  return { file, bytes: buf.length }
}

function writeCredits() {
  const section = [
    '',
    '## Photography',
    '',
    'The curated photography set in `public/images/` (product, bean, atelier, and',
    'origin shots) is sourced from Unsplash under the Unsplash License (free to use',
    'commercially, no permission or attribution legally required; credited below as',
    'good practice). Fetched via `scripts/fetch-images.mjs`.',
    '',
    ...IMAGES.map((img) => `- \`public/images/${img.file}\` — ${img.credit}`),
    '',
    `Downloaded: ${new Date().toISOString().slice(0, 10)}`,
    '',
  ].join('\n')

  let existing = ''
  if (existsSync(CREDITS_PATH)) {
    existing = readFileSync(CREDITS_PATH, 'utf8').replace(/\s*$/, '\n')
  } else {
    existing = '# Credits\n'
  }
  // Idempotent: strip any previously-written "## Photography" section (this
  // script's own output) before appending the current one, so re-running
  // doesn't duplicate content. Other sections (e.g. "## Audio") are untouched.
  existing = existing.replace(/\n## Photography\n[\s\S]*$/, '\n').replace(/\s*$/, '\n')
  writeFileSync(CREDITS_PATH, existing + section)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const results = []
  for (const img of IMAGES) {
    const r = await downloadOne(img)
    console.log(`OK  ${r.file}  ${(r.bytes / 1024).toFixed(1)} KB`)
    results.push(r)
  }
  writeCredits()
  console.log(`\nDownloaded ${results.length} images to ${OUT_DIR}`)
  console.log(`Credits appended to ${CREDITS_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
