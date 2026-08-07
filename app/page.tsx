import FrameSequence from '@/components/scroll/FrameSequence'
import KineticType from '@/components/scroll/KineticType'

export default function Home() {
  return (
    <main>
      <FrameSequence>
        <KineticType />
      </FrameSequence>
      <section className="flex h-screen items-center justify-center">
        <p className="eyebrow">Sections follow in Task 8</p>
      </section>
    </main>
  )
}
