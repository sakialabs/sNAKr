'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

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

export default function AboutPage() {
  return (
    <div className="bg-background">
      <motion.div 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-4xl mx-auto px-6 py-12 md:py-16"
      >
        {/* Hero */}
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About sNAKr
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Shared household inventory intelligence that feels human
          </p>
        </motion.div>

        {/* What is sNAKr */}
        <motion.section variants={fadeInUp} className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-3">What is sNAKr?</h2>
          <p className="text-lg text-muted-foreground mb-3">
            sNAKr is shared household inventory intelligence. We help you stay stocked, waste less, and keep it human.
          </p>
          <p className="text-lg text-muted-foreground">
            Upload receipts, track what you have, and get smart restock recommendations. No judgment. No blame. Just helpful signals for everyday people.
          </p>
        </motion.section>

        {/* How it works */}
        <motion.section variants={fadeInUp} className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon="📸"
              title="Upload receipts"
              description="Snap a photo of your grocery receipt. We'll parse it and update your inventory automatically."
            />
            <FeatureCard
              icon="📊"
              title="Track inventory"
              description="See what you have at a glance. Quick actions let you mark items as used or restocked."
            />
            <FeatureCard
              icon="🛒"
              title="Get recommendations"
              description="Smart restock list tells you what's running low and why. Export or share with your household."
            />
          </div>
        </motion.section>

        {/* Meet Fasoolya */}
        <motion.section variants={fadeInUp} className="mb-12 bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">Meet Fasoolya</h2>
          <p className="text-lg text-muted-foreground mb-4">
            Fasoolya is your mischievous AI buddy who helps you navigate sNAKr. Playful, helpful, and never judgmental.
          </p>
          <Link 
            href="/fasoolya"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            Meet Fasoolya
            <span>→</span>
            
          </Link>
        </motion.section>

        {/* Why we built this */}
        <motion.section variants={fadeInUp} className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-3">Why we built this</h2>
          <p className="text-lg text-muted-foreground mb-3">
            We got tired of running out of milk. And eggs. And that one thing we always forget.
          </p>
          <p className="text-lg text-muted-foreground">
            sNAKr is for everyday people who want to stay stocked without the stress. No fancy IoT devices required. Just your phone, your receipts, and a little help from Fasoolya.
          </p>
        </motion.section>

        {/* Open source CTA */}
        <motion.section 
          variants={fadeInUp} 
          className="bg-card border border-border rounded-xl p-6 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground mb-3">Built in public, made for people</h2>
          <p className="text-lg text-muted-foreground mb-4">
            sNAKr is open source. We build in the open, learn in the open, and welcome anyone who wants to help make household inventory less annoying.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            Get in touch
            <span>→</span>
          </Link>
        </motion.section>
      </motion.div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}
