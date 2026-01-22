import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Logo size="sm" showText={true} href="/" />
            <p className="text-sm text-muted-foreground">
              Shared household inventory intelligence with receipt ingestion and explainable predictions.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/households" className="text-muted-foreground hover:text-foreground transition-colors">
                  Households
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-muted-foreground hover:text-foreground transition-colors">
                  Inventory
                </Link>
              </li>
              <li>
                <Link href="/receipts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Receipts
                </Link>
              </li>
              <li>
                <Link href="/restock" className="text-muted-foreground hover:text-foreground transition-colors">
                  Restock
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">© {currentYear} sNAKr. Stay stocked. Waste less. Keep it human.</p>
        </div>
      </div>
    </footer>
  )
}
