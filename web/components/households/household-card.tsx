'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Household } from '@/lib/api/types'

interface HouseholdCardProps {
  household: Household
}

export function HouseholdCard({ household }: HouseholdCardProps) {
  const formattedDate = new Date(household.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/households/${household.id}`}>
        <div className="p-20 border border-input rounded-card bg-card hover:bg-accent transition-colors cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {household.name}
              </h3>
              <p className="text-sm text-muted">
                Created {formattedDate}
              </p>
            </div>
            <svg
              className="w-20 h-20 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
