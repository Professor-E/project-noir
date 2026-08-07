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
