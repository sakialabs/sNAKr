'use client'

import { useRouter } from 'next/navigation'
import { useHouseholdContext } from '@/lib/contexts/household-context'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HouseholdSelectorProps {
  className?: string
}

export function HouseholdSelector({ className }: HouseholdSelectorProps) {
  const router = useRouter()
  const { currentHousehold, households, loading, setCurrentHousehold } = useHouseholdContext()

  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-5 w-32 rounded" />
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
    <div className={cn("w-full", className)}>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Current Household
      </div>
      <DropdownMenu
        trigger={
          <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-grape-primary/[0.03] hover:bg-grape-primary/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group">
            <span className="text-sm font-medium text-foreground truncate">
              {currentHousehold?.name || 'Select Household'}
            </span>
            <svg
              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        }
        align="start"
      >
      <DropdownMenuLabel>Switch Household</DropdownMenuLabel>
      
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
                className="w-4 h-4 text-primary ml-2 flex-shrink-0"
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
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-muted-foreground"
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
    </div>
  )
}
