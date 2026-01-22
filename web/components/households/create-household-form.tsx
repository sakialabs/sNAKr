'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { createHousehold } from '@/lib/api/endpoints/households'
import { getErrorMessage } from '@/lib/api/client'
import type { HouseholdCreate } from '@/lib/api/types'

interface CreateHouseholdFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateHouseholdForm({ onSuccess, onCancel }: CreateHouseholdFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate household name
    if (!name.trim()) {
      setError('Household name is required')
      return
    }

    if (name.trim().length < 2) {
      setError('Household name must be at least 2 characters')
      return
    }

    if (name.trim().length > 100) {
      setError('Household name must be less than 100 characters')
      return
    }

    setLoading(true)

    try {
      const householdData: HouseholdCreate = {
        name: name.trim(),
      }

      const household = await createHousehold(householdData)
      
      showToast(`Household "${household.name}" created successfully!`, 'success')
      
      // Reset form
      setName('')
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh the page to show the new household
      router.refresh()
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Household Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Smith Family, Apartment 4B"
        error={error}
        disabled={loading}
        autoFocus
        maxLength={100}
      />

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading || !name.trim()}
        >
          Create Household
        </Button>
      </div>
    </form>
  )
}
