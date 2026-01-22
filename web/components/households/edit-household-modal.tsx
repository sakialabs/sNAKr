'use client'

import { useState } from 'react'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { updateHousehold } from '@/lib/api/endpoints/households'
import { getErrorMessage } from '@/lib/api/client'
import type { Household } from '@/lib/api/types'

interface EditHouseholdModalProps {
  isOpen: boolean
  onClose: () => void
  household: Household
  onSuccess?: () => void
}

export function EditHouseholdModal({ isOpen, onClose, household, onSuccess }: EditHouseholdModalProps) {
  const { showToast } = useToast()
  const [name, setName] = useState(household.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      await updateHousehold(household.id, { name: name.trim() })
      showToast(`Household renamed to "${name.trim()}"`, 'success')
      onSuccess?.()
      onClose()
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Household"
      description="Update your household name"
    >
      <form onSubmit={handleSubmit}>
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

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading || !name.trim() || name.trim() === household.name}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
