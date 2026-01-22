'use client'

import { motion } from 'framer-motion'
import { Fasoolya } from '@/components/Fasoolya'

export default function FasoolyaPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-content mx-auto px-16 py-48">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="text-center mb-32">
            <Fasoolya animated={true} size="xl" className="mb-16" />
            <h1 className="text-4xl font-semibold text-foreground mb-12">
              Meet Fasoolya
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Your mischievous AI buddy who helps you stay stocked without the stress
            </p>
          </div>

          <div className="space-y-32">
            <section className="bg-card border border-border rounded-card p-24">
              <h2 className="text-2xl font-semibold text-foreground mb-12">
                Who is Fasoolya?
              </h2>
              <p className="text-foreground leading-relaxed mb-12">
                Fasoolya is the friendly face of sNAKr. Part helper, part buddy, 
                all mischief. Fasoolya shows up when you need a little warmth, like 
                when you&apos;re reviewing receipts or checking your restock list.
              </p>
              <p className="text-foreground leading-relaxed">
                But Fasoolya knows when to step back. No nagging. No guilt. 
                Just helpful signals when you need them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-16">
                What Fasoolya does
              </h2>
              <div className="grid md:grid-cols-2 gap-16">
                <div className="bg-card border border-border rounded-card p-16">
                  <h3 className="font-semibold text-foreground mb-8">
                    Parses receipts
                  </h3>
                  <p className="text-muted text-sm">
                    &ldquo;I found a few updates from your receipt. Want me to apply them?&rdquo;
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-card p-16">
                  <h3 className="font-semibold text-foreground mb-8">
                    Checks inventory
                  </h3>
                  <p className="text-muted text-sm">
                    &ldquo;We&apos;re looking steady. No surprises today.&rdquo;
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-card p-16">
                  <h3 className="font-semibold text-foreground mb-8">
                    Spots trends
                  </h3>
                  <p className="text-muted text-sm">
                    &ldquo;Heads up: a couple essentials are trending Low.&rdquo;
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-card p-16">
                  <h3 className="font-semibold text-foreground mb-8">
                    Stays calm
                  </h3>
                  <p className="text-muted text-sm">
                    No panic. No blame. Just helpful signals.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-grape-100 dark:bg-grape-900 rounded-card p-24">
              <h2 className="text-2xl font-semibold text-foreground mb-12">
                Fasoolya&apos;s rules
              </h2>
              <ul className="space-y-8 text-foreground">
                <li className="flex items-start gap-8">
                  <span className="text-primary">✓</span>
                  <span>Playful in the app, calm in notifications</span>
                </li>
                <li className="flex items-start gap-8">
                  <span className="text-primary">✓</span>
                  <span>Helpful signals, never guilt trips</span>
                </li>
                <li className="flex items-start gap-8">
                  <span className="text-primary">✓</span>
                  <span>Household-safe (no &ldquo;who used it&rdquo; tracking)</span>
                </li>
                <li className="flex items-start gap-8">
                  <span className="text-primary">✓</span>
                  <span>Explainable predictions (always shows why)</span>
                </li>
                <li className="flex items-start gap-8">
                  <span className="text-primary">✓</span>
                  <span>Respects your choices (you&apos;re always in control)</span>
                </li>
              </ul>
            </section>

            <section className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-12">
                Ready to meet Fasoolya?
              </h2>
              <p className="text-muted mb-16">
                Sign up for sNAKr and start tracking your inventory with a little help from your new buddy.
              </p>
              <a 
                href="/auth/signup"
                className="inline-block bg-primary text-primary-foreground px-24 py-12 rounded-button hover:bg-primary/90 transition-colors"
              >
                Get started
              </a>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
