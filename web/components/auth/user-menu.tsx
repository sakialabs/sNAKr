'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { signOut } from '@/app/(public)/auth/actions'
import { Skeleton } from '@/components/ui/skeleton'

export function UserMenu() {
  const { user, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <Skeleton className="w-10 h-10 rounded-full" />
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/auth/signin')}
          className="px-4 py-2 text-sm text-foreground hover:bg-grape-primary/[0.03] dark:hover:bg-white/[0.03] rounded-lg transition-colors"
        >
          Sign in
        </button>
        <button
          onClick={() => router.push('/auth/signup')}
          className="px-4 py-2 text-sm bg-grape-primary text-white rounded-lg hover:bg-grape-deep active:bg-grape-shadow transition-colors shadow-sm"
        >
          Sign up
        </button>
      </div>
    )
  }

  const initials = user.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || '??'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {initials}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.user_metadata?.full_name || 'User'}
              </p>
            </div>

            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/settings')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <button
                onClick={() => {
                  router.push('/households')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Households
              </button>
            </div>

            <div className="border-t border-border">
              <button
                onClick={async () => {
                  setIsOpen(false)
                  await signOut()
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
