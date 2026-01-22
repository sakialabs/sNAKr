'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="bg-background"
    >
      {/* Hero Section */}
      <motion.section variants={fadeInUp} className="max-w-7xl mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Welcome to sNAKr
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
          Shared household inventory intelligence with receipt ingestion and explainable predictions
        </p>
        <p className="text-muted-foreground mb-8">
          Stay stocked. Waste less. Keep it human.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link 
            href="/auth/signup"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Get Started
          </Link>
          <Link 
            href="/about"
            className="px-6 py-2.5 border border-border rounded-lg hover:bg-grape-primary/5 dark:hover:bg-white/10 transition-colors font-medium"
          >
            Learn More
          </Link>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section variants={fadeInUp} className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
          Everything you need to manage your household
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            href="/households"
            emoji="🏠"
            title="Households"
            description="Manage your households and invite members to collaborate"
          />
          <FeatureCard
            href="/inventory"
            emoji="📦"
            title="Inventory"
            description="Track what you have with fuzzy states that feel natural"
          />
          <FeatureCard
            href="/receipts"
            emoji="🧾"
            title="Receipts"
            description="Upload receipts and let smart mapping update your inventory"
          />
          <FeatureCard
            href="/restock"
            emoji="🛒"
            title="Restock List"
            description="Get smart recommendations with clear explanations"
          />
          <FeatureCard
            href="/settings"
            emoji="⚙️"
            title="Settings"
            description="Customize your experience and manage preferences"
          />
          <FeatureCard
            href="/fasoolya"
            emoji="🦝"
            title="Meet Fasoolya"
            description="Your friendly raccoon guide to household harmony"
          />
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section variants={fadeInUp} className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join households everywhere who are staying stocked, wasting less, and keeping it human.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link 
              href="/auth/signup"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Create Free Account
            </Link>
            <Link 
              href="/contact"
              className="px-6 py-2.5 border border-border rounded-lg hover:bg-grape-primary/5 dark:hover:bg-white/10 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

function FeatureCard({ href, emoji, title, description }: {
  href: string
  emoji: string
  title: string
  description: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Link 
        href={href}
        className="flex flex-col h-full p-5 bg-card border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all group"
      >
        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{emoji}</div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground flex-1">{description}</p>
      </Link>
    </motion.div>
  )
}
