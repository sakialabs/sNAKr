'use server'

/**
 * Authentication Server Actions
 * 
 * These server actions handle authentication flows:
 * - Email/password sign up and sign in
 * - Magic link authentication
 * - Sign out
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthResult = {
  success: boolean
  error?: string
  message?: string
}

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
    }
  }

  if (password.length < 8) {
    return {
      success: false,
      error: 'Password must be at least 8 characters',
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: 'Check your email to confirm your account',
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/households')
}

/**
 * Send magic link to email
 */
export async function sendMagicLink(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return {
      success: false,
      error: 'Email is required',
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: 'Check your email for the magic link',
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/signin')
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}
