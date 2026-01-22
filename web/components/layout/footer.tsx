import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container max-w-content mx-auto px-16 py-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-32">
          {/* Brand */}
          <div className="space-y-12">
            <Logo size="sm" showText={true} href="/" />
            <p className="text-sm text-muted">
              Shared household inventory intelligence with receipt ingestion and explainable predictions.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-12">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-8 text-sm">
              <li>
                <Link href="/households" className="text-muted hover:text-foreground transition-colors">
                  Households
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-muted hover:text-foreground transition-colors">
                  Inventory
                </Link>
              </li>
              <li>
                <Link href="/receipts" className="text-muted hover:text-foreground transition-colors">
                  Receipts
                </Link>
              </li>
              <li>
                <Link href="/restock" className="text-muted hover:text-foreground transition-colors">
                  Restock
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-12">
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-8 text-sm">
              <li>
                <Link href="/about" className="text-muted hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-12">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-8 text-sm">
              <li>
                <Link href="/privacy" className="text-muted hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-32 pt-24 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 text-sm text-muted">
            <p>© {currentYear} sNAKr. Stay stocked. Waste less. Keep it human.</p>
            <div className="flex items-center gap-16">
              <a
                href="https://github.com/snakr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
