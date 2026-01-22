'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
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
        <div className="flex items-center justify-center py-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-content mx-auto px-16 py-32">
        <div className="text-center py-64">
          <p className="text-red-600 dark:text-red-400 mb-16">{error}</p>
          <Button onClick={refetchHouseholds}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-content mx-auto px-16 py-32">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-3xl font-bold mb-8">Households</h1>
          <p className="text-muted">
            Manage your households and invite members to share inventory tracking.
          </p>
        </div>
        {!showCreateForm && (
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            <svg
              className="w-20 h-20 mr-8"
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
      </div>

      <AnimatePresence mode="wait">
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-32 overflow-hidden"
          >
            <div className="p-24 border border-input rounded-card bg-card">
              <h2 className="text-xl font-semibold mb-16">Create New Household</h2>
              <CreateHouseholdForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {households.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-64"
        >
          <Fasoolya size="lg" className="mx-auto mb-24" />
          <h2 className="text-2xl font-semibold mb-12">No households yet</h2>
          <p className="text-muted mb-24 max-w-md mx-auto">
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
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
          {households.map((household) => (
            <HouseholdCard key={household.id} household={household} />
          ))}
        </div>
      )}
    </div>
  )
}
