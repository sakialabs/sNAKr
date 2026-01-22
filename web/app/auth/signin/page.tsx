'use client'

import { useState, useTransition, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, sendMagicLink } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showMagicLink, setShowMagicLink] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Show error from URL params (e.g., from callback)
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(decodeURIComponent(urlError))
    }
    const urlMessage = searchParams.get('message')
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    startTransition(async () => {
      const result = await signIn(formData)
      if (!result.success) {
        setError(result.error || 'Sign in failed')
      }
      // If successful, the action will redirect
    })
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'apple' | 'facebook') => {
    setError(null)
    setMessage(null)

    // Use environment variable for redirect URL (works in both SSR and client)
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError(null)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', email)

    startTransition(async () => {
      const result = await sendMagicLink(formData)
      if (result.success) {
        setMessage(result.message || 'Magic link sent!')
        setShowMagicLink(false)
      } else {
        setError(result.error || 'Failed to send magic link')
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-6xl mb-12"
          >
            🍇
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-semibold text-foreground mb-8"
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted"
          >
            Sign in to your sNAKr account
          </motion.p>
        </div>

        {/* Alert Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-16 px-16 py-12 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-card"
            >
              <div className="flex items-start gap-12">
                <span className="text-red-600 dark:text-red-400 text-xl">✕</span>
                <p className="text-sm text-red-900 dark:text-red-100 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-16 px-16 py-12 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-card"
            >
              <div className="flex items-start gap-12">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <p className="text-sm text-green-900 dark:text-green-100 flex-1">{message}</p>
                <button
                  onClick={() => setMessage(null)}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur-sm border border-border rounded-card p-24 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {!showMagicLink ? (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-20"
              >
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  icon={
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  icon={
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <Button type="submit" loading={isPending} className="w-full">
                  Sign in
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowMagicLink(true)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Use magic link instead
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="magic-link-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-20"
              >
                <div className="text-center mb-20">
                  <h2 className="text-xl font-semibold text-foreground mb-8">Magic Link</h2>
                  <p className="text-sm text-muted">
                    We&apos;ll send you a link to sign in without a password
                  </p>
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  icon={
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                <Button onClick={handleMagicLink} loading={isPending} className="w-full">
                  Send magic link
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowMagicLink(false)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to password sign in
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OAuth Section */}
          <div className="mt-24 pt-24 border-t border-border">
            <p className="text-sm text-muted text-center mb-12">
              Or continue with
            </p>
            <div className="grid grid-cols-2 gap-8">
              <Button
                variant="outline"
                onClick={() => handleOAuth('google')}
                className="w-full"
              >
                <svg className="w-20 h-20 mr-8" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('github')}
                className="w-full"
              >
                <svg className="w-20 h-20 mr-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('apple')}
                className="w-full"
                title="Sign in with Apple"
              >
                <svg className="w-20 h-20 mr-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('facebook')}
                className="w-full"
                title="Sign in with Facebook"
              >
                <svg className="w-20 h-20 mr-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted mt-16"
        >
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-6xl animate-pulse">🍇</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
