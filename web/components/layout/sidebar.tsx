'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { HouseholdSelector } from '@/components/households/household-selector'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/lib/hooks/useAuth'
import { signOut } from '@/app/(public)/auth/actions'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Households',
    href: '/households',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Receipts',
    href: '/receipts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Restock List',
    href: '/restock',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapseChange }: SidebarProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  const initials = user?.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || '??'

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapseChange?.(newState)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          'fixed left-0 top-0 h-screen bg-card border-r border-border z-50',
          'flex flex-col'
        )}
      >
        {/* Header with Logo and Collapse */}
        <div className="flex items-center justify-between p-4 border-b border-border min-h-[64px]">
          {!isCollapsed ? (
            <>
              <Logo size="sm" showText={true} href="/households" />
              <button
                onClick={toggleCollapse}
                className="p-2 hover:bg-grape-primary/[0.03] dark:hover:bg-white/[0.03] rounded-lg transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex justify-center w-full">
              <Logo size="sm" showText={false} href="/households" />
            </div>
          )}
        </div>

        {/* Collapsed: Expand Button */}
        {isCollapsed && (
          <div className="p-3 border-b border-border flex justify-center">
            <button
              onClick={toggleCollapse}
              className="p-2 hover:bg-grape-primary/[0.03] dark:hover:bg-white/[0.03] rounded-lg transition-colors"
              title="Expand sidebar"
            >
              <svg
                className="w-5 h-5 rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* User Profile Section */}
        <div className={cn("px-4 border-b border-border", isCollapsed ? "pt-3 pb-3" : "pt-4 pb-4")}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/profile"
                className={cn(
                  "w-10 h-10 rounded-full bg-grape-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all hover:ring-2 hover:ring-grape-primary/30 dark:hover:ring-grape-primary/50 hover:ring-offset-2 hover:ring-offset-background",
                  pathname === '/profile' && "ring-2 ring-grape-primary/30 dark:ring-grape-primary/50 ring-offset-2 ring-offset-background"
                )}
              >
                {initials}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/profile"
                className={cn(
                  "w-10 h-10 rounded-full bg-grape-primary text-white flex items-center justify-center text-sm font-medium transition-all hover:ring-2 hover:ring-grape-primary/30 dark:hover:ring-grape-primary/50 hover:ring-offset-2 hover:ring-offset-background",
                  pathname === '/profile' && "ring-2 ring-grape-primary/30 dark:ring-grape-primary/50 ring-offset-2 ring-offset-background"
                )}
              >
                {initials}
              </Link>
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* Household Selector */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-b border-border">
            <HouseholdSelector className="w-full" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-grape-primary/[0.03] dark:hover:bg-white/[0.03]',
                  isActive && 'bg-grape-primary/10 text-grape-primary dark:bg-grape-primary/20',
                  !isActive && 'text-foreground',
                  isCollapsed && 'justify-center'
                )}
              >
                {item.icon}
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleSignOut}
            title={isCollapsed ? 'Sign out' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full',
              'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950',
              isCollapsed && 'justify-center'
            )}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  )
}

