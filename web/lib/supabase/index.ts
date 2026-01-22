/**
 * Supabase Client Exports
 * 
 * This file provides convenient exports for all Supabase client types.
 * Import the appropriate client based on your use case:
 * 
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 * - Server Components: import { createClient } from '@/lib/supabase/server'
 * - Middleware: import { updateSession } from '@/lib/supabase/middleware'
 */

// Re-export for convenience
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'
