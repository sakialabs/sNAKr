'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { deleteHousehold } from '@/lib/api/endpoints/households'
import { getErrorMessage } from '@/lib/api/client'
import type { Household } from '@/lib/api/types'

interface DeleteHouseholdModalProps {
  isOpen: boolean
  onClose: () => void
  household: Household
  onSuccess?: () => void
}

export function DeleteHouseholdModal({ isOpen, onClose, household, onSuccess }: DeleteHouseholdModalProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      await deleteHousehold(household.id)
      showToast(`"${household.name}" has been deleted`, 'success')
      onSuccess?.()
      onClose()
      router.push('/households')
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Household"
      description="This action cannot be undone"
    >
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          Are you sure you want to delete <span className="font-semibold">"{household.name}"</span>?
        </p>
        <p className="text-sm text-muted-foreground">
          All inventory data, receipts, and member access will be permanently removed.
        </p>
      </div>

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
          type="button"
          onClick={handleDelete}
          loading={loading}
          disabled={loading}
          className="bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white"
        >
          Delete Household
        </Button>
      </ModalFooter>
    </Modal>
  )
}
