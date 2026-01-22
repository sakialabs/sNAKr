'use client'

import Link from 'next/link'
import { UserMenu } from '@/components/auth/user-menu'
import { HouseholdSelector } from '@/components/households/household-selector'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/lib/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
        {/* Logo */}
        <Logo size="md" showText={true} href="/" />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link 
            href="/about" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link 
            href="/fasoolya" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Meet Fasoolya
          </Link>
          <Link 
            href="/contact" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Right side: Theme Toggle + Household Selector + User Menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {loading ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : (
            <>
              {user && <HouseholdSelector />}
              <UserMenu />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
