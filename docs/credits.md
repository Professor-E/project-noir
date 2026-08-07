# Credits

## Photography / footage

The pinned frame sequence in `public/frames/` (`noir-0001.webp` … `noir-0120.webp`) is
sourced from the project's own source film supplied for this build. No third-party
stock license applies.

## Audio

**Ambient café loop** — `public/audio/ambience.mp3`

- Source: Freesound.org — ["Coffee Shop Ambience (remastered)"](https://freesound.org/people/C_Rogers/sounds/453074/) by user `C_Rogers` (remaster of a recording by `waweee`)
- Direct file used: `https://freesound.org/data/previews/453/453074_3569783-hq.mp3`
- License: CC0 1.0 (Creative Domain / Public Domain Dedication) — free to copy, modify, distribute, and use commercially without permission or attribution
- Downloaded: 2026-08-06

Note: the brief's originally specified source
(`https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3`) returned
HTTP 403 (dead/expired CDN link) at implementation time, so it was substituted with
the CC0 Freesound track above per the brief's documented fallback instructions.

## Photography

The curated photography set in `public/images/` (product, bean, atelier, and
origin shots) is sourced from Unsplash under the Unsplash License (free to use
commercially, no permission or attribution legally required; credited below as
good practice). Fetched via `scripts/fetch-images.mjs`.

- `public/images/product-aurora.jpg` — Photo by Cphotos on Unsplash — https://unsplash.com/photos/8blVdQB0hoI
- `public/images/product-meridian.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1615464637805-16154b4d5ea1
- `public/images/product-obsidian.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1625608343997-d53dca75aa09
- `public/images/product-ember.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1510591509098-f4fdc6d0ff04
- `public/images/product-midnight-oil.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1596952954288-16862d37405b
- `public/images/product-atlas.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1704985181792-8006d9086eaf
- `public/images/bean-light.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1712143525667-717b146a141f
- `public/images/bean-medium.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1624258247141-0d28b2f5b6d2
- `public/images/bean-dark.jpg` — Photo on Unsplash — https://unsplash.com/photos/photo-1628236876894-dbde8ff5a944
- `public/images/atelier-1.jpg` — Photo by Emma Ou on Unsplash — https://unsplash.com/photos/a-dimly-lit-room-with-a-counter-and-shelves-qSMHX9Qky3c
- `public/images/atelier-2.jpg` — Photo by Alexander Kjær Grote on Unsplash — https://unsplash.com/photos/a-dark-room-with-a-lamp-and-a-coffee-maker-ZpgyRflcLX4
- `public/images/atelier-3.jpg` — Photo by Charles Postiaux on Unsplash — https://unsplash.com/photos/an-espresso-machine-sitting-on-top-of-a-counter-kLfAST5nqjM
- `public/images/origin-ethiopia.jpg` — Photo by PROJETO CAFÉ GATO-MOURISCO on Unsplash — https://unsplash.com/photos/coffee-berries-growing-on-a-leafy-branch-w2_RA1-3NaU
- `public/images/origin-colombia.jpg` — Photo by Candes J on Unsplash — https://unsplash.com/photos/farmer-holding-bucket-of-ripe-coffee-cherries-we5u09a0AxA
- `public/images/origin-sumatra.jpg` — Photo by LIVESTART STIVEN on Unsplash — https://unsplash.com/photos/hands-picking-ripe-red-coffee-cherries-from-branches-aXLk1YTaxNM

Note on `origin-ethiopia.jpg` and `origin-sumatra.jpg`: real coffee-farm
photography is inherently outdoor/daylight, and after two rounds of
sourcing, no available Unsplash photo of genuine coffee cultivation for
these two regions fully clears the dark/warm grade standalone (ethiopia
is a saturated-green branch macro with only small warm cherry accents;
sumatra has a strong warm cast on skin/cherries but a bright soft-green
bokeh background with no black/near-black anchor). Both were kept —
thematically accurate, real coffee cherries/harvest visible — with the
grading gap intentionally deferred to a CSS darkening/warming treatment
when placed into page components (e.g. `brightness-75 contrast-110
sepia-[.12]` or a dark gradient overlay), per the design spec's allowance
(`docs/superpowers/specs/2026-08-06-noir-design.md` §9: "graded
consistently toward the video's palette via CSS filters where needed").
`origin-colombia.jpg` was replaced in this round for a cool-blue-clashing
plaid shirt; its replacement is warmer-neutral but still fairly bright,
so it is a secondary candidate for the same CSS treatment if needed.

Downloaded: 2026-08-07
