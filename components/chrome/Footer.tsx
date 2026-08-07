import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="relative bg-void px-6 pb-8 pt-24 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-16 border-t border-bone/10 pt-16 md:grid-cols-3 md:gap-8">
        <div className="md:col-span-1">
          <span
            className="display block w-full leading-[0.8] text-bone"
            style={{ fontSize: 'clamp(4rem, 16vw, 11rem)' }}
          >
            NOIR
          </span>
        </div>

        <nav aria-label="Footer" className="md:col-span-1">
          <span className="eyebrow mb-4 block">Navigate</span>
          <ul className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-cursor
                  className="text-sm text-bone/80 transition-colors hover:text-bone"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-1">
          <span className="eyebrow mb-4 block">Contact</span>
          <p className="text-sm text-bone/80">
            Questions, wholesale, press — reach Noir at{' '}
            <a
              href="mailto:hello@noir.coffee"
              data-cursor
              className="text-crema underline-offset-4 hover:underline"
            >
              hello@noir.coffee
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-2 border-t border-bone/10 pt-6 text-xs text-ash md:flex-row md:items-center md:justify-between">
        <p>© 2026 Noir. All rights reserved.</p>
        <p>Photography credited in docs/credits.md.</p>
      </div>
    </footer>
  )
}
