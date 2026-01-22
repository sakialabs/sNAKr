# Supabase Client Setup for Next.js

This directory contains Supabase client configurations for different Next.js contexts.

## Overview

The Supabase client is configured to work seamlessly with Next.js App Router, using cookies for session management. There are three different client configurations:

1. **Client Component Client** (`client.ts`) - For use in Client Components
2. **Server Component Client** (`server.ts`) - For use in Server Components, Server Actions, and Route Handlers
3. **Middleware Client** (`middleware.ts`) - For use in Next.js middleware to refresh sessions

## Usage

### Client Components

Use this in components with the `'use client'` directive:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return <div>User: {user?.email}</div>
}
```

### Server Components

Use this in Server Components (default in App Router):

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <div>User: {user?.email}</div>
}
```

### Server Actions

Use this in Server Actions:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items')
    .insert({
      name: formData.get('name'),
      // ... other fields
    })

  if (error) {
    throw error
  }

  revalidatePath('/items')
  return data
}
```

### Route Handlers

Use this in API routes:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### Middleware

The middleware is already set up in `web/middleware.ts` and runs automatically on every request to refresh the user's session.

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under API.

## Authentication Examples

### Sign Up

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignUpForm() {
  const supabase = createClient()

  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Error signing up:', error.message)
      return
    }
    
    console.log('User signed up:', data.user)
  }

  // ... form implementation
}
```

### Sign In

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignInForm() {
  const supabase = createClient()

  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Error signing in:', error.message)
      return
    }
    
    console.log('User signed in:', data.user)
  }

  // ... form implementation
}
```

### Sign In with OAuth

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function OAuthButtons() {
  const supabase = createClient()

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      console.error('Error signing in with OAuth:', error.message)
    }
  }

  return (
    <div>
      <button onClick={() => handleOAuthSignIn('google')}>
        Sign in with Google
      </button>
      <button onClick={() => handleOAuthSignIn('github')}>
        Sign in with GitHub
      </button>
    </div>
  )
}
```

### Sign In with Magic Link

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function MagicLinkForm() {
  const supabase = createClient()

  const handleMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      console.error('Error sending magic link:', error.message)
      return
    }
    
    console.log('Magic link sent to:', email)
  }

  // ... form implementation
}
```

### Sign Out

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error.message)
      return
    }
    
    router.push('/login')
    router.refresh()
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

### Get Current User

```typescript
// In a Server Component
import { createClient } from '@/lib/supabase/server'

export default async function UserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  )
}
```

## Database Queries

### Fetching Data

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function ItemsList() {
  const supabase = await createClient()
  
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error)
    return <div>Error loading items</div>
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

### Inserting Data

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(name: string, category: string) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      name,
      category,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  revalidatePath('/items')
  return data
}
```

### Updating Data

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateItem(id: string, updates: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  revalidatePath('/items')
  return data
}
```

### Deleting Data

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteItem(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }

  revalidatePath('/items')
}
```

## Real-time Subscriptions

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function RealtimeItems() {
  const [items, setItems] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial data
    const fetchItems = async () => {
      const { data } = await supabase.from('items').select('*')
      setItems(data || [])
    }
    fetchItems()

    // Subscribe to changes
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        (payload) => {
          console.log('Change received!', payload)
          // Update items based on payload
          if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

## Storage (File Uploads)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function FileUpload() {
  const supabase = createClient()

  const handleUpload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(`${Date.now()}-${file.name}`, file)

    if (error) {
      console.error('Error uploading file:', error)
      return
    }

    console.log('File uploaded:', data)
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.path)
    
    console.log('Public URL:', publicUrl)
  }

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
      }}
    />
  )
}
```

## Row Level Security (RLS)

The Supabase client automatically enforces Row Level Security policies defined in your database. Make sure to set up appropriate RLS policies for your tables to ensure data security.

Example RLS policy for household-scoped data:

```sql
-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see items from their households
CREATE POLICY "Users can view household items"
  ON items
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert items to their households
CREATE POLICY "Users can insert household items"
  ON items
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE user_id = auth.uid()
    )
  );
```

## Best Practices

1. **Always use the appropriate client** - Use the server client for Server Components and the browser client for Client Components
2. **Handle errors gracefully** - Always check for errors in Supabase responses
3. **Revalidate paths** - Use `revalidatePath()` after mutations to update the UI
4. **Protect routes** - Use middleware or Server Components to check authentication
5. **Use TypeScript** - Define types for your database tables for better type safety
6. **Optimize queries** - Use `.select()` to only fetch the columns you need
7. **Use RLS** - Always enable Row Level Security on your tables

## Troubleshooting

### Session not persisting
- Make sure middleware is properly configured
- Check that cookies are being set correctly
- Verify environment variables are set

### CORS errors
- Ensure your Supabase project has the correct site URL configured
- Check that redirect URLs are whitelisted in Supabase Auth settings

### RLS blocking queries
- Verify your RLS policies are correct
- Check that the user is authenticated
- Use the Supabase dashboard to test queries with different users

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
