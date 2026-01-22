'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Household } from '@/lib/api/types'
import { getHouseholds } from '@/lib/api/endpoints/households'

interface HouseholdContextType {
  currentHousehold: Household | null
  households: Household[]
  loading: boolean
  error: string | null
  setCurrentHousehold: (household: Household | null) => void
  refetchHouseholds: () => Promise<void>
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined)

const STORAGE_KEY = 'snakr_current_household_id'

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [currentHousehold, setCurrentHouseholdState] = useState<Household | null>(null)
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHouseholds = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getHouseholds()
      const householdsList = data?.households || []
      setHouseholds(householdsList)

      // If we have households, set the current one
      if (householdsList.length > 0) {
        // Try to restore from localStorage
        const savedHouseholdId = localStorage.getItem(STORAGE_KEY)
        const savedHousehold = householdsList.find(h => h.id === savedHouseholdId)
        
        // Use saved household if found, otherwise use the first one
        setCurrentHouseholdState(savedHousehold || householdsList[0])
      } else {
        setCurrentHouseholdState(null)
      }
    } catch (err) {
      // Don't log to console - just set user-friendly error message
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      setHouseholds([])
      setCurrentHouseholdState(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouseholds()
  }, [])

  const setCurrentHousehold = (household: Household | null) => {
    setCurrentHouseholdState(household)
    if (household) {
      localStorage.setItem(STORAGE_KEY, household.id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const refetchHouseholds = async () => {
    await fetchHouseholds()
  }

  return (
    <HouseholdContext.Provider
      value={{
        currentHousehold,
        households,
        loading,
        error,
        setCurrentHousehold,
        refetchHouseholds,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHouseholdContext() {
  const context = useContext(HouseholdContext)
  if (context === undefined) {
    throw new Error('useHouseholdContext must be used within a HouseholdProvider')
  }
  return context
}
