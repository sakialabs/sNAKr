'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [email] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const initials = email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || '??'

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="w-20 h-20 rounded-full bg-grape-primary text-white flex items-center justify-center text-2xl font-medium">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {fullName || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            {message && (
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ 
                  opacity: 1,
                  x: message.type === 'error' ? [0, -10, 10, -10, 10, -5, 5, 0] : 0,
                }}
                transition={{ 
                  x: { duration: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.2 }
                }}
                className={`px-3 py-2.5 rounded-lg border ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg 
                    className={`w-4 h-4 flex-shrink-0 ${
                      message.type === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {message.type === 'success' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <p className={`text-xs flex-1 ${
                    message.type === 'success'
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Save Changes
            </Button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Account Created</span>
              <span className="text-foreground font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Last Sign In</span>
              <span className="text-foreground font-medium">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Email Verified</span>
              <span className={`font-medium ${
                user?.email_confirmed_at ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {user?.email_confirmed_at ? 'Yes' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
