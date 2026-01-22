'use client'

import { Sidebar } from './sidebar'
import { AppFooter } from './app-footer'
import { useAuth } from '@/lib/hooks/useAuth'
import { useState, useEffect } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true'
      setIsCollapsed(collapsed)
    }

    // Initial check
    handleStorageChange()

    // Listen for changes
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-6xl animate-pulse">🍇</div>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar onCollapseChange={setIsCollapsed} />
      <main 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        {children}
      </main>
      <div
        className="transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        <AppFooter />
      </div>
    </div>
  )
}
