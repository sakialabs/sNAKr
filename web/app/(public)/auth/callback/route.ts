/**
 * Auth Callback Route Handler
 * 
 * This route handles the callback from Supabase Auth after:
 * - Email confirmation
 * - Magic link authentication
 * - OAuth provider authentication
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/households'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // Redirect to error page with error message
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=${encodeURIComponent(error.message)}`
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
