'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useHouseholdContext } from '@/lib/contexts/household-context'
import { createItem } from '@/lib/api/endpoints/items'
import { getErrorMessage } from '@/lib/api/client'
import { Category, Location } from '@/lib/api/types'

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: Category.DAIRY, label: 'Dairy', emoji: '🥛' },
  { value: Category.PRODUCE, label: 'Produce', emoji: '🥬' },
  { value: Category.MEAT, label: 'Meat', emoji: '🥩' },
  { value: Category.BAKERY, label: 'Bakery', emoji: '🍞' },
  { value: Category.PANTRY_STAPLE, label: 'Pantry Staple', emoji: '🌾' },
  { value: Category.BEVERAGE, label: 'Beverage', emoji: '🥤' },
  { value: Category.SNACK, label: 'Snack', emoji: '🍿' },
  { value: Category.CONDIMENT, label: 'Condiment', emoji: '🧂' },
  { value: Category.OTHER, label: 'Other', emoji: '📦' },
]

const locations: { value: Location; label: string; icon: React.ReactElement }[] = [
  {
    value: Location.FRIDGE,
    label: 'Fridge',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    value: Location.PANTRY,
    label: 'Pantry',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    value: Location.FREEZER,
    label: 'Freezer',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
]

export default function NewItemPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { currentHousehold } = useHouseholdContext()
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>(Category.OTHER)
  const [location, setLocation] = useState<Location>(Location.PANTRY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!currentHousehold) {
      setError('No household selected')
      return
    }
    
    if (!name.trim()) {
      setError('Item name is required')
      return
    }
    
    if (name.trim().length < 2) {
      setError('Item name must be at least 2 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const item = await createItem({
        household_id: currentHousehold.id,
        name: name.trim(),
        category,
        location,
      })
      
      showToast(`${item.name} added to inventory`, 'success')
      router.push('/inventory')
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
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No household selected
          </h2>
          <p className="text-muted-foreground mb-6">
            Select a household to add items
          </p>
          <Button onClick={() => router.push('/households')}>
            Go to Households
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-2xl mx-auto px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/inventory')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inventory
        </button>
        <h1 className="text-3xl font-bold mb-2">Add Item</h1>
        <p className="text-muted-foreground">
          Add a new item to your household inventory
        </p>
      </div>
      
      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Item Name */}
        <div>
          <Input
            label="Item Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Milk, Eggs, Bread"
            error={error}
            disabled={loading}
            autoFocus
            maxLength={255}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Keep it simple. You can always edit later.
          </p>
        </div>
        
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  category === cat.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Where do you keep it?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {locations.map((loc) => (
              <button
                key={loc.value}
                type="button"
                onClick={() => setLocation(loc.value)}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                  location === loc.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {loc.icon}
                <span className="text-sm font-medium">{loc.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/inventory')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || !name.trim()}
          >
            Add Item
          </Button>
        </div>
      </motion.form>
      
      {/* Helper Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg"
      >
        <p className="text-sm text-foreground">
          <span className="font-medium">Tip:</span> New items start with an "OK" state. 
          You can update the state anytime from the inventory list.
        </p>
      </motion.div>
    </motion.div>
  )
}
