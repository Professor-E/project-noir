import type { Metadata } from 'next'
import { Bodoni_Moda, Inter } from 'next/font/google'
import Cursor from '@/components/chrome/Cursor'
import Footer from '@/components/chrome/Footer'
import Nav from '@/components/chrome/Nav'
import Preloader from '@/components/chrome/Preloader'
import SoundToggle from '@/components/chrome/SoundToggle'
import SmoothScroll from '@/components/scroll/SmoothScroll'
import CartDrawer from '@/components/shop/CartDrawer'
import './globals.css'

// Bodoni Moda is variable across 400–900, so `.display` can ask for real weight
// instead of faking it. Instrument Serif shipped 400 only, and every synthetic
// bold (text-stroke, font-weight: 700) smeared the glyph edges.
const serif = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-serif',
})
const sans = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Noir — Slow-roasted single origin coffee',
  description:
    'Noir roasts single-origin coffee to the edge and never past it. Twenty-two hours of cold extraction, six origins, shipped within days of the roast.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-void text-bone">
        {/* If JS is blocked or a chunk fails to load, nothing ever raises the
            GSAP-driven reveals off their inline start state and most of the
            body copy stays invisible. This puts all three back at rest. */}
        <noscript>
          <style>{`
            [data-reveal],[data-manifesto-line],[data-brew-step]{opacity:1!important;transform:none!important;visibility:visible!important}
            [data-preloader]{display:none!important}
          `}</style>
        </noscript>
        <Preloader />
        <Cursor />
        {/* First focusable element in the document; the preloader and cursor
            above it render no tab stops of their own. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <SmoothScroll>{children}</SmoothScroll>
        <Footer />
        <CartDrawer />
        <SoundToggle />
      </body>
    </html>
  )
}
