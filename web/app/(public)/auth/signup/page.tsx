'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { signUp } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    startTransition(async () => {
      const result = await signUp(formData)
      if (result.success) {
        setMessage(result.message || 'Account created! Check your email.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(result.error || 'Sign up failed')
      }
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

  const passwordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: '', color: '' }
    if (pass.length < 8) return { strength: 1, label: 'Too short', color: 'bg-red-500' }
    
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.length >= 12) strength++
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++
    if (/\d/.test(pass)) strength++
    if (/[^a-zA-Z0-9]/.test(pass)) strength++

    if (strength <= 2) return { strength: 2, label: 'Weak', color: 'bg-orange-500' }
    if (strength <= 3) return { strength: 3, label: 'Good', color: 'bg-yellow-500' }
    return { strength: 4, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(password)

  return (
    <main className="bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        key="signup"
        initial={{ opacity: 0, rotateY: 15, scale: 0.95 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        exit={{ opacity: 0, rotateY: -15, scale: 0.95 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.34, 1.56, 0.64, 1],
          rotateY: { duration: 0.6 }
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ 
              rotate: [0, -5, 5, -5, 5, 0],
              transition: { 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 0.3
              }
            }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-9xl mb-4 inline-block cursor-pointer leading-none"
          >
            🍇
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-1"
          >
            Join sNAKr
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            Stay stocked. Waste less. Keep it human.
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg"
        >
          {/* Alert Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ 
                  opacity: 1,
                  x: [0, -5, 5, -3, 3, 0],
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  x: { duration: 0.4, ease: "easeInOut" },
                  opacity: { duration: 0.2 }
                }}
                className="mb-3 px-3 py-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-xs text-red-900 dark:text-red-100 flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ 
                  opacity: 1,
                  x: [0, -5, 5, -3, 3, 0],
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  x: { duration: 0.4, ease: "easeInOut" },
                  opacity: { duration: 0.2 }
                }}
                className="mb-3 px-3 py-2.5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xs text-green-900 dark:text-green-100 flex-1">{message}</p>
                  <button
                    onClick={() => setMessage(null)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength.strength / 4) * 100}%` }}
                        className={`h-full ${strength.color} transition-all duration-300`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{strength.label}</span>
                  </div>
                </motion.div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <Button type="submit" loading={isPending} className="w-full">
              Create account
            </Button>
          </form>

          {/* OAuth Section */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Or continue with
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleOAuth('google')}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('apple')}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('facebook')}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-3"
        >
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}
