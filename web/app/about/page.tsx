import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-content mx-auto px-16 py-48">
        <h1 className="text-4xl font-semibold text-foreground mb-24">
          About sNAKr
        </h1>
        
        <div className="space-y-24">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              What is sNAKr?
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              sNAKr is shared household inventory intelligence. We help you stay stocked, 
              waste less, and keep it human.
            </p>
            <p className="text-foreground leading-relaxed mb-12">
              Upload receipts, track what you have, and get smart restock recommendations. 
              No judgment. No blame. Just helpful signals for everyday people.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-16">
              <div className="bg-card border border-border rounded-card p-16">
                <div className="text-3xl mb-8">📸</div>
                <h3 className="font-semibold text-foreground mb-8">Upload receipts</h3>
                <p className="text-muted text-sm">
                  Snap a photo of your grocery receipt. We&apos;ll parse it and update your inventory automatically.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-card p-16">
                <div className="text-3xl mb-8">📊</div>
                <h3 className="font-semibold text-foreground mb-8">Track inventory</h3>
                <p className="text-muted text-sm">
                  See what you have at a glance. Quick actions let you mark items as used or restocked.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-card p-16">
                <div className="text-3xl mb-8">🛒</div>
                <h3 className="font-semibold text-foreground mb-8">Get recommendations</h3>
                <p className="text-muted text-sm">
                  Smart restock list tells you what&apos;s running low and why. Export or share with your household.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Meet Fasoolya
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              Fasoolya is your mischievous AI buddy who helps you navigate sNAKr. 
              Playful, helpful, and never judgmental.
            </p>
            <Link 
              href="/fasoolya"
              className="inline-block bg-primary text-primary-foreground px-16 py-12 rounded-button hover:bg-primary/90 transition-colors"
            >
              Meet Fasoolya
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Why we built this
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              We got tired of running out of milk. And eggs. And that one thing we always forget.
            </p>
            <p className="text-foreground leading-relaxed">
              sNAKr is for everyday people who want to stay stocked without the stress. 
              No fancy IoT devices required. Just your phone, your receipts, and a little help from Fasoolya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-12">
              Open source
            </h2>
            <p className="text-foreground leading-relaxed mb-12">
              sNAKr is open source and built in public. Check out the code, contribute, or just poke around.
            </p>
            <Link 
              href="/contact"
              className="inline-block text-primary hover:text-primary/80 transition-colors"
            >
              View on GitHub →
            </Link>
          </section>
        </div>
      </div>
    </main>
  )
}
