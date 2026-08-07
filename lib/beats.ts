export type Beat = { word: string; sub: string; from: number; to: number }

export const BEATS: Beat[] = [
  { word: 'NOIR', sub: 'Est. 2019 · Single Origin', from: 0.0, to: 0.22 },
  { word: 'SLOW', sub: 'Twenty-two hours of cold extraction', from: 0.25, to: 0.45 },
  { word: 'DARK', sub: 'Roasted to the edge, never past it', from: 0.5, to: 0.7 },
  { word: 'PURE', sub: 'Enter the collection', from: 0.78, to: 1.0 },
]

const FADE = 0.2 // fraction of the beat's span spent fading in and out

export function beatOpacity(beat: Beat, progress: number): number {
  const span = beat.to - beat.from
  const local = (progress - beat.from) / span
  if (local <= 0 || local >= 1) return 0
  if (local < FADE) return local / FADE
  if (local > 1 - FADE) return (1 - local) / FADE
  return 1
}
