# Noir

A cinematic marketing and commerce site for a fictional single-origin coffee roaster.

The landing page opens on a 120-frame film sequence scrubbed by scroll position, with
kinetic type cut against it beat by beat. Below the fold: a manifesto, a horizontally
scrolled collection, a draggable roast explorer, a brew guide with counting numerals,
an origin strip and a closing call to action. The shop carries six products, each with
a procedurally generated 3D bag rendered in WebGL, and a cart that persists across
reloads. Every motion effect is gated on `prefers-reduced-motion`.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Animation | GSAP 3 + ScrollTrigger |
| Smooth scroll | Lenis |
| 3D | three.js (procedural bag geometry, no external model) |
| State | Zustand with `persist` (cart) |
| Tests | Vitest |

## Getting started

```bash
npm install     # install dependencies
npm run dev     # dev server on http://localhost:3000
npm test        # run the Vitest suite
npm run build   # production build
```

Two more scripts exist: `npm run start` serves the production build, and
`npm run lint` runs ESLint.

## Project layout

```
app/            routes (/, /shop, /shop/[slug], /about, /contact, /api/contact)
components/
  brew/         brew guide
  chrome/       nav, footer, preloader, cursor, sound toggle
  scroll/       frame sequence, kinetic type, reveal primitives
  sections/     landing page sections
  shop/         product grid, add-to-cart, cart drawer, roast slider
  three/        WebGL bag canvas + fallback
lib/            pure logic — frame math, cart math, products, validation, motion
tests/          Vitest suites covering everything in lib/
scripts/        asset pipelines (see below)
public/frames/  noir-0001.webp … noir-0120.webp
docs/           credits
```

Business logic lives in `lib/` as pure functions so it can be tested without a DOM.
The Vitest suite targets that layer.

## Asset pipelines

### Hero frames

`public/frames/` holds the 120 WebP stills the hero scrubs through. They are generated
from a source film, not committed by hand. To regenerate them:

```bash
node scripts/extract-frames.mjs "C:/path/to/source.mp4"
```

The script shells out to `ffmpeg` (which must be on `PATH`), resamples the source to
hit exactly 120 frames across the clip, scales to 1280px wide and encodes WebP at
quality 72. It wipes and recreates `public/frames/` on each run. If you change the
frame count, update `FRAME_COUNT` in both `scripts/extract-frames.mjs` and
`lib/frames.ts` so the scrub math stays in sync.

### Photography

`node scripts/fetch-images.mjs` downloads the curated photography set into
`public/images/` and refreshes the Photography section of `docs/credits.md`.

## Integration seams

Two places are deliberately stubbed and marked in-file for a real backend to drop into.

**Stripe checkout** — `components/shop/CartDrawer.tsx`, the `onCheckout` handler
(around line 247). It currently sets a notice string. Replace it with a `POST` to an
`/api/checkout` route that creates a Stripe Checkout session and redirects to
`session.url`. The cart lines it needs are already in the Zustand store
(`lib/cart-store.ts`), and per-line pricing math is in `lib/cart-math.ts`.

**Contact email** — `app/api/contact/route.ts`. The route validates the payload with
`lib/contact-validation.ts` and returns `{ ok: true }`, logging the message instead of
sending it. Swap the `console.log` for Resend, Formspree or equivalent.

## Credits

Photography, footage and audio attribution — including licences and sources — is in
[`docs/credits.md`](docs/credits.md).

## Known limitation

Automated screenshot capture was not possible in the environment this site was built
in: the headless browser never composited frames, so `requestAnimationFrame` never
fired and no visual capture could be taken. Every non-visual check passes — tests,
typecheck, lint, production build, and a route-by-route DOM walkthrough at 1440px and
390px confirming correct status codes, titles, hydration, and no horizontal overflow —
but **a manual visual QA pass in a real browser is recommended before considering the
site fully shipped.** Worth eyeballing in particular: the hero scrub and preloader
hand-off, the roast slider drag, the 3D bag, and the cart drawer.
