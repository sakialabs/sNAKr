'use client'

import { useEffect, useState } from 'react'
import { getHouseholds } from '@/lib/api/endpoints/households'
import type { Household } from '@/lib/api/types'

export function useHouseholds() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHouseholds = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getHouseholds()
      setHouseholds(data.households)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load households')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouseholds()
  }, [])

  return {
    households,
    loading,
    error,
    refetch: fetchHouseholds,
  }
}
