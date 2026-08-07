// Extracts FRAME_COUNT WebP stills from the source film into public/frames.
// Usage: node scripts/extract-frames.mjs "C:/path/to/source.mp4"
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const SOURCE = process.argv[2]
if (!SOURCE) {
  console.error('Usage: node scripts/extract-frames.mjs <source-video>')
  process.exit(1)
}

const OUT = path.resolve('public/frames')
const FRAME_COUNT = 120
const SOURCE_FPS = 24
const DURATION = 10.005
const TARGET_FPS = FRAME_COUNT / DURATION // ~11.99

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

execFileSync(
  'ffmpeg',
  [
    '-i', SOURCE,
    '-vf', `fps=${TARGET_FPS},scale=1280:-2`,
    '-frames:v', String(FRAME_COUNT),
    '-c:v', 'libwebp',
    '-quality', '72',
    '-compression_level', '6',
    '-an',
    path.join(OUT, 'noir-%04d.webp'),
  ],
  { stdio: 'inherit' },
)

console.log(`Extracted frames to ${OUT} (source ${SOURCE_FPS}fps -> ${TARGET_FPS.toFixed(2)}fps)`)
