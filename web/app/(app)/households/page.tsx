'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateHouseholdForm } from '@/components/households/create-household-form'
import { HouseholdCard } from '@/components/households/household-card'
import { useHouseholdContext } from '@/lib/contexts/household-context'
import { Fasoolya } from '@/components/Fasoolya'

export default function HouseholdsPage() {
  const { households, loading, error, refetchHouseholds } = useHouseholdContext()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    refetchHouseholds()
  }

  if (loading) {
    return (
      <div className="container max-w-content mx-auto px-16 py-32">
        <div className="flex items-center justify-between mb-16">
          <div className="flex-1">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-48 rounded-card" />
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : String(error)
    const isNetworkError = errorMessage.includes('Network error') || errorMessage.includes('Unable to connect')
    
    return (
      <div className="container max-w-content mx-auto px-6 py-12">
        <div className="text-center py-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl mb-6"
          >
            🦝
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {isNetworkError ? 'Unable to Load Households' : 'Something Went Wrong'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {isNetworkError
              ? "We're having trouble connecting to the server. Please try again in a moment."
              : errorMessage
            }
          </p>
          <Button onClick={refetchHouseholds}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-content mx-auto px-6 py-8"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Households</h1>
          <p className="text-muted-foreground">
            Manage your households and invite members to share inventory tracking.
          </p>
        </div>
        {!showCreateForm && (
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Household
          </Button>
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="mb-8 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-6 border border-border rounded-lg bg-card"
            >
              <h2 className="text-xl font-semibold mb-4">Create New Household</h2>
              <CreateHouseholdForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {households.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-20"
        >
          <Fasoolya animated size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No households yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first household to start tracking shared inventory with your family or roommates.
          </p>
          {!showCreateForm && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Household
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {households.map((household, index) => (
            <motion.div
              key={household.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <HouseholdCard household={household} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
