'use client'

import { motion } from 'framer-motion'
import { Fasoolya } from '@/components/Fasoolya'

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

export default function FassoolyaPage() {
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <Fasoolya size="xl" animated />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Fasoolya
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your mischievous AI buddy who helps you stay stocked without the stress
          </p>
        </motion.div>

        {/* Who is Fasoolya */}
        <motion.section variants={fadeInUp} className="mb-10 bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">Who is Fasoolya?</h2>
          <p className="text-lg text-muted-foreground mb-3">
            Fasoolya is the friendly face of sNAKr. Part helper, part buddy, all mischief. Fasoolya shows up when you need a little warmth, like when you're reviewing receipts or checking your restock list.
          </p>
          <p className="text-lg text-muted-foreground">
            But Fasoolya knows when to step back. No nagging. No guilt. Just helpful signals when you need them.
          </p>
        </motion.section>

        {/* What Fasoolya does */}
        <motion.section variants={fadeInUp} className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-6">What Fasoolya does</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <PersonalityCard
              title="Parses receipts"
              description="I found a few updates from your receipt. Want me to apply them?"
            />
            <PersonalityCard
              title="Checks inventory"
              description="We're looking steady. No surprises today."
            />
            <PersonalityCard
              title="Spots trends"
              description="Noticed you usually restock milk on Tuesdays. Just a heads up."
            />
            <PersonalityCard
              title="Stays calm"
              description="No stress. All things. Just helpful signals."
            />
          </div>
        </motion.section>

        {/* Personality */}
        <motion.section variants={fadeInUp} className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">Fasoolya's personality</h2>
          <div className="space-y-3">
            <TraitCard
              emoji="🎭"
              trait="Playful but not annoying"
              description="Light touches of humor without being overbearing"
            />
            <TraitCard
              emoji="🤝"
              trait="Helpful but not pushy"
              description="Offers suggestions, never demands action"
            />
            <TraitCard
              emoji="💜"
              trait="Warm but not clingy"
              description="Shows up when needed, steps back when not"
            />
            <TraitCard
              emoji="🎯"
              trait="Smart but not condescending"
              description="Explains clearly without talking down"
            />
          </div>
        </motion.section>

        {/* Why a raccoon */}
        <motion.section variants={fadeInUp} className="text-center bg-accent/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">Why a raccoon?</h2>
          <p className="text-lg text-muted-foreground mb-3">
            Raccoons are clever, resourceful, and a little mischievous. They're great at finding what they need and making the most of what they have.
          </p>
          <p className="text-lg text-muted-foreground">
            Just like you managing your household inventory. 🦝
          </p>
        </motion.section>
      </motion.div>
    </div>
  )
}

function PersonalityCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all"
    >
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground italic">{description}</p>
    </motion.div>
  )
}

function TraitCard({ emoji, trait, description }: { emoji: string; trait: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex items-start gap-3 bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all"
    >
      <span className="text-3xl">{emoji}</span>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{trait}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
