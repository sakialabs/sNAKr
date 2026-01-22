import Link from 'next/link'
import { UserMenu } from '@/components/auth/user-menu'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-16 py-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <span className="text-3xl">🍇</span>
            <h1 className="text-xl font-semibold text-foreground">sNAKr</h1>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-16 py-64 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-16">
          Welcome to sNAKr
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-32">
          Shared household inventory intelligence with receipt ingestion and explainable predictions
        </p>
        <p className="text-muted mb-48">
          Stay stocked. Waste less. Keep it human.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-12">
          <Link 
            href="/auth/signup"
            className="px-24 py-12 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started
          </Link>
          <Link 
            href="/about"
            className="px-24 py-12 border border-border rounded-button hover:bg-accent transition-colors font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-16 py-64">
        <h2 className="text-3xl font-bold text-center text-foreground mb-48">
          Everything you need to manage your household
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          <Link 
            href="/households"
            className="p-24 bg-card border border-border rounded-card hover:shadow-lg hover:border-primary/50 transition-all group"
          >
            <div className="text-4xl mb-16 group-hover:scale-110 transition-transform">🏠</div>
            <h2 className="text-xl font-semibold mb-12 text-foreground">Households</h2>
            <p className="text-sm text-muted">
              Manage your households and invite members to collaborate
            </p>
          </Link>

          <Link 
            href="/inventory"
            className="p-24 bg-card border border-border rounded-card hover:shadow-lg hover:border-primary/50 transition-all group"
          >
            <div className="text-4xl mb-16 group-hover:scale-110 transition-transform">📦</div>
            <h2 className="text-xl font-semibold mb-12 text-foreground">Inventory</h2>
            <p className="text-sm text-muted">
              Track what you have with fuzzy states that feel natural
            </p>
          </Link>

          <Link 
            href="/receipts"
            className="p-24 bg-card border border-border rounded-card hover:shadow-lg hover:border-primary/50 transition-all group"
          >
            <div className="text-4xl mb-16 group-hover:scale-110 transition-transform">🧾</div>
            <h2 className="text-xl font-semibold mb-12 text-foreground">Receipts</h2>
            <p className="text-sm text-muted">
              Upload receipts and let smart mapping update your inventory
            </p>
          </Link>

          <Link 
            href="/restock"
            className="p-24 bg-card border border-border rounded-card hover:shadow-lg hover:border-primary/50 transition-all group"
          >
            <div className="text-4xl mb-16 group-hover:scale-110 transition-transform">🛒</div>
            <h2 className="text-xl font-semibold mb-12 text-foreground">Restock List</h2>
            <p className="text-sm text-muted">
              Get smart recommendations with clear explanations
            </p>
          </Link>

          <Link 
            href="/settings"
            className="p-24 bg-card border border-border rounded-card hover:shadow-lg hover:border-primary/50 transition-all group"
          >
            <div className="text-4xl mb-16 group-hover:scale-110 transition-transform">⚙️</div>
            <h2 className="text-xl font-semibold mb-12 text-foreground">Settings</h2>
            <p className="text-sm text-muted">
              Customize your experience and manage preferences
            </p>
          </Link>

          <Link 
            href="/fasoolya"
            className="p-24 bg-card border border-border rounded-card hover:shadow-lg hover:border-primary/50 transition-all group"
          >
            <div className="text-4xl mb-16 group-hover:scale-110 transition-transform">🦝</div>
            <h2 className="text-xl font-semibold mb-12 text-foreground">Meet Fasoolya</h2>
            <p className="text-sm text-muted">
              Your friendly raccoon guide to household harmony
            </p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-64">
        <div className="max-w-7xl mx-auto px-16 py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
            <div>
              <div className="flex items-center gap-12 mb-16">
                <span className="text-3xl">🍇</span>
                <h3 className="text-lg font-semibold text-foreground">sNAKr</h3>
              </div>
              <p className="text-sm text-muted">
                Household inventory that feels human
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-12">Product</h4>
              <ul className="space-y-8 text-sm text-muted">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/fasoolya" className="hover:text-primary transition-colors">Fasoolya</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-12">Legal</h4>
              <ul className="space-y-8 text-sm text-muted">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-32 pt-24 border-t border-border text-center text-sm text-muted">
            <p>© 2026 sNAKr. Built with 💖 for households everywhere.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

