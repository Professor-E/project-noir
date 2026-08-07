# Noir — Cinematic Coffee Site: Design Spec

Date: 2026-08-06
Repo: https://github.com/Professor-E/project-noir

## 1. Purpose

A brand site for Noir, a premium coffee roaster. Two jobs: make the coffee feel
expensive, and sell it. The site opens with a scroll-scrubbed cinematic sequence
built from a 10-second coffee film, then moves through a product range, an
interactive roast explorer, and a brew ritual guide.

Success criteria:

- The hero sequence scrubs frame-perfectly on desktop and mobile, with no stall
  on first scroll.
- A visitor can browse six products, open one, rotate it in 3D, and add it to a
  persistent cart.
- The site reads as deliberately art-directed, not templated.
- `npm run build`, `tsc --noEmit`, and ESLint all pass clean, and every
  interactive surface is verified in a real browser before completion.

## 2. Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Scroll motion | GSAP + ScrollTrigger, Lenis smooth scroll |
| 3D | three.js (procedural geometry, no imported meshes) |
| State | Zustand, localStorage-persisted cart |
| Fonts | Google Fonts, self-hosted via `next/font` |
| Deploy | GitHub only (`Professor-E/project-noir`); Vercel later |

All animated components are client islands. Content and product data are
server-rendered.

## 3. Identity

```
--noir-void    #0A0908   base
--noir-ink     #14110F   raised surface
--noir-crema   #C8A882   accent (CTA, rules, focus)
--noir-bone    #F2EDE4   primary type
--noir-ash     #8A8178   secondary type
```

Display serif for headlines (Instrument Serif / Fraunces class), tight grotesque
for UI and body. Type scale is clamped and viewport-relative; hero words reach
~18vw. All easings and durations live in `lib/motion.ts` so no component
hand-tunes its own timing.

## 4. Structure

```
app/
  layout.tsx            fonts, Lenis provider, cursor, nav, footer
  page.tsx              landing
  about/page.tsx
  contact/page.tsx
  shop/page.tsx         product index
  shop/[slug]/page.tsx  product detail (3D bag)
  api/contact/route.ts  validate + log stub
components/
  scroll/   FrameSequence, KineticType, Reveal, Parallax
  three/    CoffeeBag, BagCanvas
  shop/     ProductCard, RoastSlider, CartDrawer, AddToCart
  brew/     BrewGuide
  chrome/   Preloader, Cursor, Nav, Footer, SoundToggle
lib/        products.ts, cart-store.ts, motion.ts
public/frames/noir-0001.webp … noir-0120.webp
scripts/extract-frames.mjs
```

### Component contracts

- **FrameSequence** — props `{ frameCount, pathFor(i), heightVh, children }`.
  Owns a pinned `<canvas>` and nothing else. Publishes scroll progress (0–1) on
  a React context; children read it. Frames and overlay type change
  independently.
- **KineticType** — props `{ beats: Beat[] }` where
  `Beat = { from, to, word, sub }`. Reads progress from context. No knowledge of
  frames.
- **CoffeeBag** — props `{ label: LabelSpec, roast: 1..5 }`. Builds geometry in
  code; exposes no imperative handle.
- **cart-store** — `useCart()` returning `{ lines, add, remove, setQty, subtotal, isOpen, toggle }`.
  The only module that touches localStorage.

## 5. Hero scroll sequence

Source: `Cinematic_coffee_shot_where_it.mp4` — 1280×720, 24fps, 10.005s, 240
frames.

`scripts/extract-frames.mjs` runs ffmpeg to emit 120 WebP frames (every other
frame) at quality ~72, targeting a total payload under ~2.5MB. Frames are
committed to `public/frames/`.

The preloader decodes all 120 frames before lifting the curtain, so scrubbing
never waits on network. A 400vh pinned section maps scroll progress to frame
index with a lerped, `requestAnimationFrame`-driven draw.

Kinetic type beats:

| Progress | Word | Sub |
| --- | --- | --- |
| 0.00–0.22 | NOIR | Est. 2019 · Single Origin |
| 0.25–0.45 | SLOW | Twenty-two hours of cold extraction |
| 0.50–0.70 | DARK | Roasted to the edge, never past it |
| 0.78–1.00 | PURE | Enter the collection |

Words reveal per-word on a 0.06s stagger with a ~1.1s `expo.out`, and cross-fade
out as the next beat enters.

**Reduced motion:** under `prefers-reduced-motion: reduce` the section does not
pin. It renders a single representative frame with the four headlines stacked
statically. No canvas loop runs.

## 6. Landing page after the hero

1. **Ritual manifesto** — line-by-line mask reveal on a near-black field.
2. **The Collection** — six products, staggered entrance, image scale on hover.
3. **Roast explorer** — drag a slider from Light to Dark; bean imagery, tasting
   notes, and the section's background tone interpolate live. Keyboard
   accessible (arrow keys, `role="slider"`).
4. **Brew guide** — espresso / pour-over / French press cards expand to a timed
   step sequence with animated dose and ratio counters.
5. **Origin strip** — horizontally scrolling sourcing regions.
6. **CTA** — full-bleed close into the shop.

## 7. About and Contact

**About** — origin story told as a vertical timeline with parallax imagery, a
sourcing-ethos section, and a pull-quote set in the display serif at large
scale. Same motion vocabulary as the landing page, no second frame sequence.

**Contact** — split layout: oversized contact detail on the left, form on the
right. Client-side validation, POST to `/api/contact` which validates the
payload and logs it. Success triggers a cinematic state change (form dissolves
into a confirmation line). Swapping in Resend or Formspree is a single function
body.

## 8. Commerce

Six SKUs in `lib/products.ts`, each with slug, name, origin, altitude, process,
roast level (1–5), tasting notes, price ($22–$38), and image set. Prices and
copy are invented and trivially replaceable.

Product detail page: procedural three.js bag (gusseted body, roll-top, foil
sheen, generated label texture) that can be dragged to rotate; grind selector;
weight selector; one-time vs subscribe toggle; magnetic Add to Cart.

Cart: right-side drawer, per-line quantity steppers, animated subtotal, empty
state. Persisted to localStorage. Checkout is a stubbed handler with a clear
comment marking the Stripe integration point.

## 9. Imagery and audio

Photography is curated from Unsplash/Pexels (commercial-use licensed),
downloaded at high resolution into `public/images/`, and graded consistently
toward the video's palette via CSS filters where needed. Attribution is recorded
in `docs/credits.md`.

Ambient audio is a short looped café/pour bed, off by default, toggled by a
minimal control in the nav. It never autoplays.

## 10. Chrome

- **Preloader** — branded intro showing real frame-decode progress, then a
  curtain reveal.
- **Cursor** — blended custom cursor that scales over media and buttons;
  disabled on touch devices and under reduced motion.
- **Nav** — fixed, transparent over the hero, gaining a backdrop blur after
  scroll. Cart count badge.

## 11. Error handling

- Frame decode failure: the sequence falls back to the first successfully
  decoded frame and the section un-pins rather than showing a blank canvas.
- WebGL unavailable: `BagCanvas` renders a static product photograph instead.
- Contact API failure: inline error message, form state preserved, retry
  possible.
- Empty or corrupt cart in localStorage: store resets to empty rather than
  throwing.

## 12. Verification

Before the work is called complete:

1. `npm run build` passes with no errors.
2. `npx tsc --noEmit` clean.
3. ESLint clean.
4. The dev server is driven in a real browser: hero scrub, kinetic type,
   preloader, roast slider, brew guide, 3D bag rotation, add-to-cart and cart
   persistence, contact submit success and failure paths.
5. Screenshots captured at 1440px and 390px widths.
6. Reduced-motion path checked by emulating `prefers-reduced-motion`.

## 13. Out of scope

Real payment processing, a CMS, user accounts, internationalization, blog or
journal, and Vercel deployment. The cart's checkout handler is the designated
seam for Stripe.
