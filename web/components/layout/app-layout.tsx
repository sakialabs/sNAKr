'use client'

import { Header } from './header'
import { Nav } from './nav'
import { Footer } from './footer'
import { useAuth } from '@/lib/hooks/useAuth'

interface AppLayoutProps {
  children: React.ReactNode
  showNav?: boolean
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showNav && user && !loading && <Nav />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
