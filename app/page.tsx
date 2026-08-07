import FrameSequence from '@/components/scroll/FrameSequence'
import KineticType from '@/components/scroll/KineticType'
import Manifesto from '@/components/sections/Manifesto'
import Collection from '@/components/sections/Collection'
import RoastSlider from '@/components/shop/RoastSlider'
import BrewGuide from '@/components/brew/BrewGuide'
import OriginStrip from '@/components/sections/OriginStrip'
import ClosingCTA from '@/components/sections/ClosingCTA'

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      {/* The hero's visible type is a kinetic four-word sequence (NOIR / SLOW /
          DARK / PURE) split across animated h2s, so it cannot carry the document
          heading. This states the page in one line for screen readers and search
          crawlers without touching the composition. */}
      <h1 className="sr-only">Noir — slow-roasted single origin coffee</h1>
      <FrameSequence>
        <KineticType />
      </FrameSequence>
      <Manifesto />
      <Collection />
      <RoastSlider />
      <BrewGuide />
      <OriginStrip />
      <ClosingCTA />
    </main>
  )
}
