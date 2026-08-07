export const FRAME_COUNT = 120

export function framePath(index: number): string {
  const n = String(index + 1).padStart(4, '0')
  return `/frames/noir-${n}.webp`
}

export function frameIndexFor(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress))
  return Math.min(FRAME_COUNT - 1, Math.floor(clamped * (FRAME_COUNT - 1)))
}
