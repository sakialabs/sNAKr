'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { EditHouseholdModal } from '@/components/households/edit-household-modal'
import { DeleteHouseholdModal } from '@/components/households/delete-household-modal'
import { getHousehold, getHouseholdInvitations, createInvitation } from '@/lib/api/endpoints/households'
import { getErrorMessage } from '@/lib/api/client'
import type { HouseholdDetail, Invitation } from '@/lib/api/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function HouseholdDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { showToast } = useToast()
  
  const [household, setHousehold] = useState<HouseholdDetail | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Invitation form state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [inviting, setInviting] = useState(false)
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    loadHouseholdData()
  }, [resolvedParams.id])

  const loadHouseholdData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load household details and invitations in parallel
      const [householdData, invitationsData] = await Promise.all([
        getHousehold(resolvedParams.id),
        getHouseholdInvitations(resolvedParams.id)
      ])
      
      setHousehold(householdData)
      setInvitations(invitationsData.invitations || [])
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteEmail.trim()) {
      showToast('Email is required', 'error')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      showToast('Please enter a valid email address', 'error')
      return
    }
    
    setInviting(true)
    
    try {
      await createInvitation(resolvedParams.id, {
        email: inviteEmail.trim(),
        role: inviteRole
      })
      
      showToast(`Invitation sent to ${inviteEmail}`, 'success')
      
      // Reset form
      setInviteEmail('')
      setInviteRole('member')
      setShowInviteForm(false)
      
      // Reload invitations
      await loadHouseholdData()
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      showToast(errorMessage, 'error')
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteSuccess = () => {
    showToast('Household deleted successfully', 'success')
    router.push('/households')
  }

  const handleEditSuccess = () => {
    loadHouseholdData()
  }

  if (loading) {
    return (
      <div className="container max-w-content mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </div>
    )
  }

  if (error || !household) {
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
            Household Not Found
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {error || "We couldn't find that household. It may have been deleted or you don't have access."}
          </p>
          <Button onClick={() => router.push('/households')}>
            Back to Households
          </Button>
        </div>
      </div>
    )
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending')

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
          <button
            onClick={() => router.push('/households')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Households
          </button>
          <h1 className="text-3xl font-bold mb-2">{household.name}</h1>
          <p className="text-muted-foreground">
            Manage members and invitations for this household
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowEditModal(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="text-danger hover:text-danger hover:bg-danger/10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Members Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Members</h2>
            <span className="text-sm text-muted-foreground">
              {household.member_count || 0} {household.member_count === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Member list will be populated when we add member fetching */}
          <div className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Member management coming soon</p>
            </div>
          </div>
        </motion.div>

        {/* Invitations Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Invitations</h2>
            {!showInviteForm && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowInviteForm(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite
              </Button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showInviteForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <form onSubmit={handleInvite} className="space-y-4 p-4 bg-grape-primary/[0.03] dark:bg-white/[0.03] rounded-lg">
                  <Input
                    label="Email Address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    disabled={inviting}
                    autoFocus
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setInviteRole('member')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          inviteRole === 'member'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">Member</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Can view and update inventory
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInviteRole('admin')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          inviteRole === 'admin'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">Admin</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Can manage members and settings
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowInviteForm(false)
                        setInviteEmail('')
                        setInviteRole('member')
                      }}
                      disabled={inviting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={inviting}
                      disabled={inviting || !inviteEmail.trim()}
                    >
                      Send Invitation
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Pending ({pendingInvitations.length})
              </h3>
              {pendingInvitations.map((invitation) => (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {invitation.invitee_email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="ml-3 px-3 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
                    Pending
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {pendingInvitations.length === 0 && !showInviteForm && (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm mb-4">No pending invitations</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInviteForm(true)}
              >
                Send your first invitation
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {showEditModal && household && (
        <EditHouseholdModal
          isOpen={showEditModal}
          household={household}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && household && (
        <DeleteHouseholdModal
          isOpen={showDeleteModal}
          household={household}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </motion.div>
  )
}
