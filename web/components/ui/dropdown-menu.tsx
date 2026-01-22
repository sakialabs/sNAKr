'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function DropdownMenu({ trigger, children, align = 'end', className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <div ref={dropdownRef} className="relative block w-full">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer w-full">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] rounded-card border border-border bg-card shadow-lg',
              alignmentClasses[align],
              className
            )}
          >
            <div
              className="py-1"
              onClick={() => setIsOpen(false)}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  className?: string
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  active = false,
  className,
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2 text-left text-sm transition-colors',
        'hover:bg-grape-primary/[0.06] dark:hover:bg-white/[0.06] focus:bg-grape-primary/[0.06] dark:focus:bg-white/[0.06] focus:outline-none',
        active && 'bg-grape-primary/10 dark:bg-grape-primary/20 font-medium',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {children}
    </button>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn('my-1 h-px bg-border', className)} />
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide', className)}>
      {children}
    </div>
  )
}
