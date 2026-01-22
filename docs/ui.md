# sNAKr UI Documentation

Complete reference for the sNAKr web and mobile interfaces.

## Quick Access

- **Web App:** http://localhost:3000 (Next.js)
- **Mobile App:** Expo Go (React Native)
- **Design System:** [styles.md](./styles.md)
- **Tone Guidelines:** [tone.md](./tone.md)
- **Web Setup:** [../web/README.md](../web/README.md)
- **Mobile Setup:** [../mobile/README.md](../mobile/README.md)

## Overview

sNAKr provides web and mobile interfaces for managing shared household inventory with receipt ingestion and smart restock predictions.

**Design Philosophy:**
- Mischievous, cozy, and modern
- Grape-forward color palette
- Calm and judgment-free
- Household-safe (no blame features)

## Getting Started

### Web App (Next.js)

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

### Mobile App (React Native + Expo)

```bash
cd mobile
npm install
npm start
```

Scan QR code with Expo Go app

## Authentication

All interfaces use Supabase Auth with multiple sign-in methods:

### Supported Methods

1. **Email/Password** - Traditional authentication
2. **OAuth Providers** - Google, GitHub, Apple, Facebook
3. **Magic Links** - Passwordless email authentication

### Auth Flow

1. User signs in via any method
2. Supabase returns JWT token
3. Token stored securely (httpOnly cookies for web, secure storage for mobile)
4. Token included in all API requests
5. Automatic token refresh handled by Supabase client

### Example (Web)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Email/password sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// OAuth sign in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

// Magic link sign in
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})
```

## Design System

### Color Palette

sNAKr uses a grape-forward color system with apple and strawberry accents.

**Primary (Grape):**
- Light mode: Grape 600 `#6B2FA0`
- Dark mode: Grape 400 `#A56BEE`

**Accents:**
- Apple (green): `#2E8B57`
- Strawberry (pink): `#D72661`

**Neutrals (Ink):**
- Text primary: Ink 900 `#0F172A` (light) / `#F8FAFC` (dark)
- Text secondary: Ink 700 `#334155` (light) / `#E2E8F0` (dark)
- Muted text: Ink 500 `#64748B` (light) / `#94A3B8` (dark)

See [styles.md](./styles.md) for complete color system.

### Typography

- **Font:** Inter (or system default)
- **Headings:** SemiBold
- **Body:** Regular
- **Scale:** H1 (32px), H2 (24px), H3 (18px), Body (16px), Small (14px), Caption (12px)

### Spacing

Use the sNAKr spacing scale: 4, 8, 12, 16, 24, 32, 48px

### Border Radius

- Buttons: 12px
- Cards: 16px
- Modals: 20px
- Chips/Badges: 999px (pill shape)

### Components

Built with **shadcn/ui** (web) and custom components (mobile) following the design system.

## Web App Structure

### Routes

```
/                    - Home page
/households          - Household management
/inventory           - Inventory list with filters
/inventory/[id]      - Item detail with history
/receipts            - Receipt upload and management
/receipts/[id]       - Receipt review and confirmation
/restock             - Smart restock recommendations
/settings            - User settings and preferences
/about               - About sNAKr
/contact             - Contact and support
/privacy             - Privacy policy
/terms               - Terms of service
/fasoolya            - Meet Fasoolya (AI buddy)
/auth/signin         - Sign in page
/auth/signup         - Sign up page
```

### Key Features

#### Household Management (`/households`)
- Create new household
- View household list
- Invite members via email
- Manage member roles (admin/member)
- Switch between households

#### Inventory List (`/inventory`)
- View all items with state badges
- Filter by location (Fridge, Pantry, Freezer)
- Filter by state (Low, Almost out, Out)
- Sort by name, state, last updated
- Quick actions: Used, Restocked, Ran out
- Empty state with Fasoolya prompt

#### Item Detail (`/inventory/[id]`)
- Current state and confidence score
- Recent event history
- Predictions (days to low/out, reason codes)
- Manual state override
- Edit item name or location

#### Receipt Upload (`/receipts`)
- Drag-and-drop file upload
- Upload progress indicator
- Receipt list with status
- Delete receipts

#### Receipt Review (`/receipts/[id]`)
- View parsed line items
- Suggested item mappings with confidence
- Edit item names or mappings
- Skip items
- Bulk confirm high-confidence items
- Apply updates to inventory

#### Restock List (`/restock`)
- Three urgency sections:
  - **Need now:** Out or Almost out
  - **Need soon:** Low or predicted Low within 3 days
  - **Nice to top up:** OK with consistent usage
- Item state and reason display
- Predicted days to low/out
- Dismiss items temporarily
- Export list (text/JSON)
- Future: Nimbly integration handoff

#### Settings (`/settings`)
- Account management
- Notification preferences
- Household settings
- Data export
- Account deletion

## Mobile App Structure

### Navigation

Bottom tab navigation with 4 main tabs:
- **Inventory** - Item list and quick actions
- **Receipts** - Upload and review
- **Restock** - Smart recommendations
- **Settings** - Account and preferences

### Key Features

#### Camera Integration
- Native camera for receipt capture
- Photo library access
- Image preview before upload

#### Push Notifications
- Daily restock reminders (batched)
- Calm and factual tone
- User can opt out

#### Offline Support
- AsyncStorage for local data
- Sync when connection restored
- Optimistic UI updates

## State Management

### Web (Zustand)

```typescript
import create from 'zustand'

interface InventoryStore {
  items: Item[]
  filters: Filters
  setItems: (items: Item[]) => void
  setFilters: (filters: Filters) => void
}

const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  filters: {},
  setItems: (items) => set({ items }),
  setFilters: (filters) => set({ filters })
}))
```

### Mobile (React Context + Hooks)

```typescript
const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export const InventoryProvider: React.FC = ({ children }) => {
  const [items, setItems] = useState<Item[]>([])
  // ...
  return (
    <InventoryContext.Provider value={{ items, setItems }}>
      {children}
    </InventoryContext.Provider>
  )
}
```

## API Integration

### Web (Fetch API)

```typescript
// lib/api.ts
export async function getInventory(householdId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${API_BASE_URL}/api/v1/items?household_id=${householdId}`, {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`
    }
  })
  
  if (!response.ok) throw new Error('Failed to fetch inventory')
  return response.json()
}
```

### Mobile (Axios)

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: API_BASE_URL
})

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export const getInventory = (householdId: string) =>
  api.get(`/api/v1/items?household_id=${householdId}`)
```

## Inventory States

Visual representation using state badges:

- **Plenty** - Neutral or subtle success tint
- **OK** - Neutral
- **Low** - Warning tint (yellow/orange)
- **Almost out** - Stronger warning
- **Out** - Danger tint (red)

### State Badge Component (Web)

```tsx
interface StateBadgeProps {
  state: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
}

export function StateBadge({ state }: StateBadgeProps) {
  const styles = {
    plenty: 'bg-ink-100 text-ink-700',
    ok: 'bg-ink-100 text-ink-700',
    low: 'bg-warning/10 text-warning',
    almost_out: 'bg-warning/20 text-warning',
    out: 'bg-danger/10 text-danger'
  }
  
  return (
    <span className={`px-12 py-4 rounded-chip text-sm ${styles[state]}`}>
      {state.replace('_', ' ')}
    </span>
  )
}
```

## Tone and Voice

### In-App UI
Playful, warm, a little cheeky. Short and punchy.

**Examples:**
- "Upload receipt" (not "Please upload your receipt")
- "Confirm updates" (not "Would you like to confirm?")
- "Looking steady. No surprises today." (empty restock list)

### Notifications
Calm, minimal, factual. No jokes. No pressure.

**Examples:**
- "Essentials trending Low: milk, eggs."
- "Restock list is ready when you are."

### Errors
Respectful and helpful. Acknowledge issue, offer next step.

**Examples:**
- "Receipt upload failed. Try again, or choose a clearer photo."
- "We couldn't parse that receipt yet. You can still add items manually."

See [tone.md](./tone.md) for complete guidelines.

## Fasoolya (AI Buddy)

Fasoolya is the in-app buddy who appears in moments that benefit from warmth:
- Empty states
- Confirmation screens
- Gentle celebrations

**Fasoolya does NOT appear in:**
- Notifications
- Serious error screens
- Anything that could sound like blame

**Sample lines:**
- "I found a few updates from your receipt. Want me to apply them?"
- "We're looking steady. No surprises today."
- "Heads up: a couple essentials are trending Low."

## Accessibility

### Non-Negotiables

- Minimum contrast 4.5:1 for body text
- Do not rely on color alone for state
- Provide text labels for fuzzy states
- Focus rings visible in both modes
- Tap targets 44px minimum (mobile)
- Keyboard navigation support (web)
- Screen reader support

### Testing

- Test with VoiceOver (iOS) and TalkBack (Android)
- Test with keyboard only (web)
- Test with high contrast mode
- Test with reduced motion preferences

## Motion and Transitions

Motion should feel supportive, not flashy.

- **Duration:** 150-220ms
- **Easing:** Ease out curves
- **Micro-animations:**
  - Button press
  - Chip state change
  - List item added/confirmed
- **Avoid:** Large bouncy motion

### Example (Framer Motion)

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {content}
</motion.div>
```

## Error Handling

### Error Boundary (Web)

```tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-8">
        We couldn't load this page. Try again, or contact support if the issue persists.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground px-16 py-12 rounded-button"
      >
        Try again
      </button>
    </div>
  )
}
```

### Toast Notifications (Web)

Use shadcn/ui Toast component for success/error messages:

```tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

// Success
toast({
  title: 'Inventory updated',
  description: 'Milk marked as Low'
})

// Error
toast({
  title: 'Upload failed',
  description: 'Try again, or choose a clearer photo.',
  variant: 'destructive'
})
```

## Performance

### Web Optimization

- Server-side rendering for fast initial load
- Image optimization with Next.js Image component
- Code splitting by route
- Lazy loading for heavy components
- Optimistic UI updates for quick actions

### Mobile Optimization

- FlatList for long lists (virtualization)
- Image caching
- Offline support with AsyncStorage
- Debounced search inputs
- Optimistic UI updates

## Testing

### Web (Vitest + React Testing Library)

```bash
cd web
npm run test
```

### Mobile (Jest + React Native Testing Library)

```bash
cd mobile
npm run test
```

### E2E Testing (Playwright for web, Detox for mobile)

```bash
# Web E2E
cd web
npm run test:e2e

# Mobile E2E
cd mobile
npm run test:e2e
```

## Deployment

### Web (Netlify)

```bash
cd web
npm run build
netlify deploy --prod
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

### Mobile (Expo)

```bash
cd mobile
eas build --platform all
eas submit --platform all
```

## Support

- **Email:** support@snakr.app
- **GitHub Issues:** [github.com/snakr/issues](https://github.com/snakr/issues)
- **Discord:** [discord.gg/snakr](https://discord.gg/snakr)

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
