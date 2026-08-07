import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import Cursor from '@/components/chrome/Cursor'
import Footer from '@/components/chrome/Footer'
import Nav from '@/components/chrome/Nav'
import Preloader from '@/components/chrome/Preloader'
import SoundToggle from '@/components/chrome/SoundToggle'
import SmoothScroll from '@/components/scroll/SmoothScroll'
import CartDrawer from '@/components/shop/CartDrawer'
import './globals.css'

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
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
        <Preloader />
        <Cursor />
        <Nav />
        <SmoothScroll>{children}</SmoothScroll>
        <Footer />
        <CartDrawer />
        <SoundToggle />
      </body>
    </html>
  )
}
