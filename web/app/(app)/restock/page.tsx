'use client'

import { motion } from 'framer-motion'

export default function RestockPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-content mx-auto px-6 py-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Restock List</h1>
        <p className="text-muted-foreground">
          Smart recommendations for what to restock based on your inventory and usage patterns.
        </p>
      </motion.div>

      {/* Urgency Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {/* Urgent */}
        <div className="bg-card border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
          <div className="bg-red-50 dark:bg-red-950 px-6 py-4 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Urgent (0)</h2>
              </div>
              <span className="text-sm text-red-600 dark:text-red-400">Out of stock</span>
            </div>
          </div>
          <div className="p-6 text-center text-muted-foreground">
            No urgent items
          </div>
        </div>

        {/* Soon */}
        <div className="bg-card border border-yellow-200 dark:border-yellow-800 rounded-lg overflow-hidden">
          <div className="bg-yellow-50 dark:bg-yellow-950 px-6 py-4 border-b border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Soon (0)</h2>
              </div>
              <span className="text-sm text-yellow-600 dark:text-yellow-400">Running low</span>
            </div>
          </div>
          <div className="p-6 text-center text-muted-foreground">
            No items running low
          </div>
        </div>

        {/* Later */}
        <div className="bg-card border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
          <div className="bg-green-50 dark:bg-green-950 px-6 py-4 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">Later (0)</h2>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400">Plan ahead</span>
            </div>
          </div>
          <div className="p-6 text-center text-muted-foreground">
            No items to plan for
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-card border border-border rounded-lg p-12 text-center"
      >
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold mb-2">Your restock list is empty</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start tracking your inventory to get smart recommendations on what to restock.
        </p>
      </motion.div>
    </motion.div>
  )
}
