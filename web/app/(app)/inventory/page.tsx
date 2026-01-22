'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useHouseholdContext } from '@/lib/contexts/household-context'
import { Fasoolya } from '@/components/Fasoolya'
import { getItems } from '@/lib/api/endpoints/items'
import { getErrorMessage } from '@/lib/api/client'
import { Location, State } from '@/lib/api/types'

// State badge component
function StateBadge({ state }: { state: State }) {
  const styles = {
    plenty: 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300',
    ok: 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300',
    low: 'bg-warning/10 text-warning border border-warning/20',
    almost_out: 'bg-warning/20 text-warning border border-warning/30',
    out: 'bg-danger/10 text-danger border border-danger/20'
  }
  
  const labels = {
    plenty: 'Plenty',
    ok: 'OK',
    low: 'Low',
    almost_out: 'Almost out',
    out: 'Out'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[state]}`}>
      {labels[state]}
    </span>
  )
}

// Location icon component
function LocationIcon({ location }: { location: Location }) {
  const icons = {
    fridge: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    pantry: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    freezer: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  }
  
  return <div className="text-muted-foreground">{icons[location]}</div>
}

export default function InventoryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { currentHousehold } = useHouseholdContext()
  
  const [items, setItems] = useState<Array<{
    id: string
    name: string
    category: string
    location: Location
    created_at: string
    updated_at: string
    inventory?: {
      id: string
      state: State
      confidence: number
      last_updated: string
    }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [locationFilter, setLocationFilter] = useState<Location | 'all'>('all')
  const [stateFilter, setStateFilter] = useState<State | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'state' | 'last_updated'>('name')
  
  useEffect(() => {
    if (currentHousehold) {
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHousehold, locationFilter, stateFilter, sortBy])
  
  const loadItems = async () => {
    if (!currentHousehold) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await getItems(
        currentHousehold.id,
        locationFilter === 'all' ? undefined : locationFilter,
        stateFilter === 'all' ? undefined : stateFilter,
        undefined, // category filter
        sortBy
      )
      
      setItems(response.items || [])
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }
  
  if (!currentHousehold) {
    return (
      <div className="container max-w-content mx-auto px-6 py-12">
        <div className="text-center py-20">
          <Fasoolya size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No household selected
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Select a household to view your inventory
          </p>
          <Button onClick={() => router.push('/households')}>
            Go to Households
          </Button>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="container max-w-content mx-auto px-6 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
        </div>
      </div>
    )
  }
  
  if (error) {
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
            Couldn't load inventory
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {error}
          </p>
          <Button onClick={loadItems}>Try Again</Button>
        </div>
      </div>
    )
  }
  
  const filteredCount = items.length
  const lowItems = items.filter(i => i.inventory?.state === 'low' || i.inventory?.state === 'almost_out' || i.inventory?.state === 'out').length
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-content mx-auto px-6 py-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory</h1>
          <p className="text-muted-foreground">
            {filteredCount} {filteredCount === 1 ? 'item' : 'items'}
            {lowItems > 0 && (
              <span className="ml-2 text-warning">
                • {lowItems} running low
              </span>
            )}
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => router.push('/inventory/new')}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Location filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setLocationFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locationFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            All Locations
          </button>
          <button
            onClick={() => setLocationFilter(Location.FRIDGE)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locationFilter === Location.FRIDGE
                ? 'bg-primary text-white'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            Fridge
          </button>
          <button
            onClick={() => setLocationFilter(Location.PANTRY)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locationFilter === Location.PANTRY
                ? 'bg-primary text-white'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            Pantry
          </button>
          <button
            onClick={() => setLocationFilter(Location.FREEZER)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locationFilter === Location.FREEZER
                ? 'bg-primary text-white'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            Freezer
          </button>
        </div>
        
        {/* State filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStateFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              stateFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            All States
          </button>
          <button
            onClick={() => setStateFilter(State.LOW)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              stateFilter === State.LOW
                ? 'bg-warning text-white'
                : 'bg-card border border-border hover:border-warning/50'
            }`}
          >
            Low
          </button>
          <button
            onClick={() => setStateFilter(State.ALMOST_OUT)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              stateFilter === State.ALMOST_OUT
                ? 'bg-warning text-white'
                : 'bg-card border border-border hover:border-warning/50'
            }`}
          >
            Almost Out
          </button>
          <button
            onClick={() => setStateFilter(State.OUT)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              stateFilter === State.OUT
                ? 'bg-danger text-white'
                : 'bg-card border border-border hover:border-danger/50'
            }`}
          >
            Out
          </button>
        </div>
        
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <option value="name">Sort by Name</option>
          <option value="state">Sort by State</option>
          <option value="last_updated">Sort by Updated</option>
        </select>
      </div>
      
      {/* Items grid */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-20"
        >
          <Fasoolya animated size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3">No items yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your first item to start tracking your household inventory
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/inventory/new')}
          >
            Add Your First Item
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => router.push(`/inventory/${item.id}`)}
              className="bg-card border border-border rounded-card p-4 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <LocationIcon location={item.location} />
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {item.inventory && (
                  <StateBadge state={item.inventory.state} />
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(item.inventory?.last_updated || item.updated_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
