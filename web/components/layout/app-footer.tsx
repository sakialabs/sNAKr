'use client'

import Link from 'next/link'

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Copyright and tagline */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} sNAKr. Stay stocked. Waste less. Keep it human.
          </p>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/contact" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
