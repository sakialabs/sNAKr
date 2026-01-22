'use client'

import Link from 'next/link'
import { UserMenu } from '@/components/auth/user-menu'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
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

          {/* Right side: Theme Toggle + User Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
