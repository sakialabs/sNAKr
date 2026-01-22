# Layout Components

This directory contains the main layout components for the sNAKr web application.

## Components

### Header (`header.tsx`)
- Sticky header with sNAKr branding
- Integrates with the existing UserMenu component
- Shows sign in/sign up buttons when not authenticated
- Responsive design with backdrop blur effect

### Navigation (`nav.tsx`)
- Horizontal navigation bar with icons
- Active state highlighting with border indicator
- Links to main app sections:
  - Households
  - Inventory
  - Receipts
  - Restock
  - Settings
- Only visible when user is authenticated
- Responsive with horizontal scroll on mobile

### Footer (`footer.tsx`)
- Multi-column footer with links
- Product, Company, and Legal sections
- Brand tagline: "Stay stocked. Waste less. Keep it human."
- Social media links (GitHub)
- Copyright notice with current year

### AppLayout (`app-layout.tsx`)
- Main layout wrapper component
- Combines Header, Nav (conditional), and Footer
- Flexbox layout with sticky header and footer
- Conditionally shows navigation based on authentication state
- Accepts `showNav` prop to hide navigation on specific pages

## Usage

### In Route Groups

The layout is automatically applied to all pages in the `(app)` route group:

```tsx
// app/(app)/layout.tsx
import { AppLayout } from '@/components/layout'

export default function AppLayoutWrapper({ children }) {
  return <AppLayout>{children}</AppLayout>
}
```

### In Individual Pages

Pages within the `(app)` group automatically inherit the layout:

```tsx
// app/(app)/inventory/page.tsx
export default function InventoryPage() {
  return (
    <div className="container max-w-content mx-auto px-16 py-32">
      <h1>Inventory</h1>
      {/* Page content */}
    </div>
  )
}
```

### Without Navigation

To hide the navigation on specific pages:

```tsx
import { AppLayout } from '@/components/layout'

export default function SpecialPage() {
  return (
    <AppLayout showNav={false}>
      {/* Page content */}
    </AppLayout>
  )
}
```

## Design System

The layout components follow the sNAKr design system:

- **Colors**: Uses Grape (primary), Apple (green accent), and Ink (neutrals)
- **Spacing**: Consistent 4px-based spacing scale (4, 8, 12, 16, 24, 32, 48)
- **Border Radius**: 
  - `rounded-button` (12px) for interactive elements
  - `rounded-card` (16px) for cards
- **Max Width**: `max-w-content` (1100px) for main content areas
- **Typography**: Inter font family with semantic sizing

## Responsive Behavior

- **Mobile**: Navigation scrolls horizontally, footer stacks vertically
- **Tablet**: Navigation shows all items, footer shows 2 columns
- **Desktop**: Full layout with 4-column footer

## Authentication Integration

The layout integrates with the existing authentication system:

- Uses `useAuth()` hook to check authentication state
- Shows/hides navigation based on user login status
- UserMenu component handles sign in/sign out actions
- Supports all OAuth providers configured in the app

## Accessibility

- Semantic HTML structure (header, nav, main, footer)
- Proper heading hierarchy
- Focus states on interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigation support

## Future Enhancements

- [ ] Add breadcrumb navigation for deep pages
- [ ] Add mobile hamburger menu for better mobile UX
- [ ] Add theme toggle (light/dark mode)
- [ ] Add notification bell in header
- [ ] Add household switcher in header
