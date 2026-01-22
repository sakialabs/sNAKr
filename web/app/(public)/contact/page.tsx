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

export default function ContactPage() {
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
            Get in touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Support */}
          <motion.section variants={fadeInUp}>
            <div className="bg-card border border-border rounded-xl p-6 h-full hover:shadow-lg transition-all">
              <h2 className="text-2xl font-bold text-foreground mb-3">Support</h2>
              <p className="text-muted-foreground mb-4">
                Need help? Have questions? We're here for you.
              </p>
              
              <div className="space-y-3">
                <ContactItem
                  label="Email"
                  value="support@snakr.app"
                  href="mailto:support@snakr.app"
                />
                <ContactItem
                  label="Discord"
                  value="Join our community"
                  href="#"
                />
              </div>
            </div>
          </motion.section>

          {/* Contribute */}
          <motion.section variants={fadeInUp}>
            <div className="bg-card border border-border rounded-xl p-6 h-full hover:shadow-lg transition-all">
              <h2 className="text-2xl font-bold text-foreground mb-3">Contribute</h2>
              <p className="text-muted-foreground mb-4">
                sNAKr is open source. Contributions welcome!
              </p>
              
              <div className="space-y-3">
                <ContactItem
                  label="GitHub"
                  value="View repository"
                  href="#"
                />
                <ContactItem
                  label="Issues"
                  value="Report bugs or request features"
                  href="#"
                />
                <ContactItem
                  label="Contributing"
                  value="Read contribution guidelines"
                  href="#"
                />
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}

function ContactItem({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <motion.div whileHover={{ x: 5 }} className="transition-all">
      <dt className="text-sm font-medium text-muted-foreground mb-1">{label}</dt>
      <dd>
        <a 
          href={href}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          {value}
        </a>
      </dd>
    </motion.div>
  )
}
