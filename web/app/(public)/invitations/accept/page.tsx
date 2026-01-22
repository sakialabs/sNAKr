'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { Fasoolya } from '@/components/Fasoolya'
import { getInvitationByToken, acceptInvitation } from '@/lib/api/endpoints/households'
import { getErrorMessage } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Invitation, InvitationAcceptResponse } from '@/lib/api/types'

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const { user, loading: authLoading } = useAuth()
  
  const token = searchParams.get('token')
  
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided')
      setLoading(false)
      return
    }

    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      
      const invitationData = await getInvitationByToken(token)
      setInvitation(invitationData)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!token || !user) return

    setAccepting(true)

    try {
      const response: InvitationAcceptResponse = await acceptInvitation(token)
      
      setAccepted(true)
      showToast(response.message, 'success')
      
      // Redirect to the household page after a short delay
      setTimeout(() => {
        router.push(`/households/${response.household_id}`)
      }, 2000)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    showToast('Invitation declined', 'success')
    router.push('/households')
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto mb-8" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Fasoolya size="lg" className="mx-auto mb-6" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Invalid Invitation
          </h1>
          <p className="text-muted-foreground mb-8">
            {error || "This invitation link is invalid or has expired. Please ask for a new invitation."}
          </p>
          
          <Button onClick={() => router.push('/households')}>
            Go to Households
          </Button>
        </motion.div>
      </div>
    )
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expires_at) < new Date()
  const isAlreadyAccepted = invitation.status === 'accepted'

  // Expired or already accepted state
  if (isExpired || isAlreadyAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Fasoolya size="lg" className="mx-auto mb-6" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {isExpired ? 'Invitation Expired' : 'Already Accepted'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isExpired
              ? 'This invitation has expired. Please ask for a new invitation.'
              : 'This invitation has already been accepted.'}
          </p>
          
          <Button onClick={() => router.push('/households')}>
            Go to Households
          </Button>
        </motion.div>
      </div>
    )
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Fasoolya animated size="lg" className="mx-auto mb-6" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Sign In to Accept
          </h1>
          <p className="text-muted-foreground mb-2">
            You've been invited to join <span className="font-semibold text-foreground">{invitation.household_name}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in or create an account to accept this invitation
          </p>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(`/auth/signin?redirect=/invitations/accept?token=${token}`)}
              className="w-full"
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push(`/auth/signup?redirect=/invitations/accept?token=${token}`)}
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success state (after accepting)
  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Welcome to {invitation.household_name}!
          </h1>
          <p className="text-muted-foreground mb-8">
            You're now a {invitation.role} of this household. Redirecting...
          </p>
        </motion.div>
      </div>
    )
  }

  // Main invitation acceptance UI
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <Fasoolya animated size="lg" className="mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            You're Invited!
          </h1>
          <p className="text-muted-foreground">
            Join a household and start tracking inventory together
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-card p-6 mb-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {invitation.household_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                You've been invited as a <span className="font-medium text-foreground">{invitation.role}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Invited to: <span className="font-medium text-foreground">{invitation.invitee_email}</span></span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expires: <span className="font-medium text-foreground">{new Date(invitation.expires_at).toLocaleDateString()}</span></span>
            </div>
          </div>

          {invitation.role === 'admin' && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                <span className="font-medium">Admin privileges:</span> You'll be able to manage members, send invitations, and delete the household.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleAccept}
            loading={accepting}
            disabled={accepting}
            className="w-full"
          >
            Accept Invitation
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleDecline}
            disabled={accepting}
            className="w-full"
          >
            Decline
          </Button>
        </motion.div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By accepting, you agree to share inventory tracking with other household members
        </p>
      </motion.div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto mb-8" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
