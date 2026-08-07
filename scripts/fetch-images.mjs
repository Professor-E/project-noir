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
  // Fix round (2026-08-06): all 3 replaced — originals failed the dark/warm
  // grade constraint (bright subway-tile shop, bright sepia café, mostly-lit
  // wood surface). New picks are low-key: dark walls/surfaces dominate the
  // frame with a single warm tungsten/amber light source, per the task
  // reviewer's brief.
  {
    file: 'atelier-1.jpg',
    url: 'https://images.unsplash.com/photo-1633524418541-4390f0fbeca9?w=1800&q=80&fm=jpg',
    credit: 'Photo by Emma Ou on Unsplash — https://unsplash.com/photos/a-dimly-lit-room-with-a-counter-and-shelves-qSMHX9Qky3c',
  },
  {
    file: 'atelier-2.jpg',
    url: 'https://images.unsplash.com/photo-1735910626330-25ce60e05e84?w=1800&q=80&fm=jpg',
    credit: 'Photo by Alexander Kjær Grote on Unsplash — https://unsplash.com/photos/a-dark-room-with-a-lamp-and-a-coffee-maker-ZpgyRflcLX4',
  },
  {
    file: 'atelier-3.jpg',
    url: 'https://images.unsplash.com/photo-1552975955-b7a92c9aa248?w=1800&q=80&fm=jpg',
    credit: 'Photo by Charles Postiaux on Unsplash — https://unsplash.com/photos/an-espresso-machine-sitting-on-top-of-a-counter-kLfAST5nqjM',
  },

  // Origin / farm landscapes.
  // Fix round (2026-08-06): all 3 replaced — originals failed the dark/warm
  // grade constraint (full-daylight green valley, pale-blue-sky vista, hazy
  // jungle with no visible coffee). Real coffee-farm photography is
  // inherently outdoor/daylight, so these lean on tight, shaded, or
  // warm-lit crops (shade-grown branches, hand-harvested cherries against
  // dark backgrounds) that both show genuine coffee cultivation and hold
  // the noir grade better than any wide daylight vista available. See the
  // fix-round report for the CSS-darkening-filter fallback note.
  {
    file: 'origin-ethiopia.jpg',
    url: 'https://images.unsplash.com/photo-1746367805612-bc46ff00bf9a?w=1800&q=80&fm=jpg',
    credit: 'Photo by PROJETO CAFÉ GATO-MOURISCO on Unsplash — https://unsplash.com/photos/coffee-berries-growing-on-a-leafy-branch-w2_RA1-3NaU',
  },
  {
    file: 'origin-colombia.jpg',
    url: 'https://images.unsplash.com/photo-1629008642899-178df6fc5f2f?w=1800&q=80&fm=jpg',
    credit: 'Photo by Nguyen Tong Hai Van on Unsplash — https://unsplash.com/photos/red-and-brown-round-fruits-in-white-plastic-bucket-b8xo59IcAUY',
  },
  {
    file: 'origin-sumatra.jpg',
    url: 'https://images.unsplash.com/photo-1762277142860-fdc8c4cfbdd9?w=1800&q=80&fm=jpg',
    credit: 'Photo by LIVESTART STIVEN on Unsplash — https://unsplash.com/photos/hands-picking-ripe-red-coffee-cherries-from-branches-aXLk1YTaxNM',
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
