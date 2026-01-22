'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function NotFound() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Back Button - Top Left */}
      <motion.button
        onClick={() => router.back()}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 left-6 p-3 rounded-lg bg-grape-primary/[0.03] hover:bg-grape-primary/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-colors"
        aria-label="Go back"
      >
        <svg 
          className="w-6 h-6 text-foreground" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </motion.button>

      {/* Theme Toggle - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 right-6"
      >
        <ThemeToggle />
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg w-full"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-9xl mb-6"
        >
          🦝
        </motion.div>
        <h1 className="text-7xl font-bold text-foreground mb-4">
          404
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page wandered off somewhere
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={user ? "/households" : "/"}
            className="inline-flex items-center justify-center bg-grape-primary text-white px-8 py-3 rounded-lg hover:bg-grape-deep transition-colors font-medium shadow-md shadow-grape-shadow/25 text-base"
          >
            {user ? "Go to Households" : "Go Home"}
          </Link>
          {user && (
            <Link 
              href="/inventory"
              className="inline-flex items-center justify-center border border-border px-8 py-3 rounded-lg hover:bg-grape-primary/5 dark:hover:bg-white/10 transition-colors font-medium text-base"
            >
              View Inventory
            </Link>
          )}
        </div>
      </motion.div>
    </main>
  )
}

