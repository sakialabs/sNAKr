'use client'

import { useRouter } from 'next/navigation'
import { useHouseholdContext } from '@/lib/contexts/household-context'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface HouseholdSelectorProps {
  className?: string
}

export function HouseholdSelector({ className }: HouseholdSelectorProps) {
  const router = useRouter()
  const { currentHousehold, households, loading, setCurrentHousehold } = useHouseholdContext()

  if (loading) {
    return (
      <div className={cn('flex items-center gap-8', className)}>
        <div className="h-32 w-32 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (households.length === 0) {
    return null
  }

  const handleHouseholdChange = (householdId: string) => {
    const household = households.find(h => h.id === householdId)
    if (household) {
      setCurrentHousehold(household)
    }
  }

  const handleManageHouseholds = () => {
    router.push('/households')
  }

  return (
    <DropdownMenu
      trigger={
        <div
          className={cn(
            'flex items-center gap-8 px-12 py-8 rounded-button border border-input',
            'hover:bg-accent transition-colors cursor-pointer',
            className
          )}
        >
          <svg
            className="w-20 h-20 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-sm font-medium text-foreground max-w-[150px] truncate">
            {currentHousehold?.name || 'Select Household'}
          </span>
          <svg
            className="w-16 h-16 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      }
      align="end"
    >
      <DropdownMenuLabel>Your Households</DropdownMenuLabel>
      
      {households.map((household) => (
        <DropdownMenuItem
          key={household.id}
          onClick={() => handleHouseholdChange(household.id)}
          active={currentHousehold?.id === household.id}
        >
          <div className="flex items-center justify-between w-full">
            <span className="truncate">{household.name}</span>
            {currentHousehold?.id === household.id && (
              <svg
                className="w-16 h-16 text-primary ml-8 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </DropdownMenuItem>
      ))}

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleManageHouseholds}>
        <div className="flex items-center gap-8">
          <svg
            className="w-16 h-16 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Manage Households</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
