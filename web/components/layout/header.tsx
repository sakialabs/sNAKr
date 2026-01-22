'use client'

import { UserMenu } from '@/components/auth/user-menu'
import { HouseholdSelector } from '@/components/households/household-selector'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/lib/hooks/useAuth'

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-64 items-center justify-between max-w-content mx-auto px-16">
        {/* Logo */}
        <Logo size="md" showText={true} href="/" />

        {/* Right side: Household Selector + User Menu */}
        <div className="flex items-center gap-16">
          {user && !loading && <HouseholdSelector />}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
