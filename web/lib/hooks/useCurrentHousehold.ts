'use client'

import { useHouseholdContext } from '@/lib/contexts/household-context'

/**
 * Hook to access the current household
 * 
 * This is a convenience hook that provides easy access to the current household
 * and related functionality from the HouseholdContext.
 * 
 * @returns The current household context
 */
export function useCurrentHousehold() {
  return useHouseholdContext()
}
