/**
 * Event API Endpoints
 * 
 * Functions for viewing the event log.
 */

import { apiClient } from '../client'
import type {
  EventFilter,
  EventList,
  EventHistoryList,
} from '../types'

// ============================================================================
// Event Log
// ============================================================================

/**
 * Get events for a household
 */
export async function getEvents(
  householdId: string,
  filter?: EventFilter
): Promise<EventList> {
  return apiClient.get<EventList>('/events', {
    params: { household_id: householdId, ...filter },
  })
}

/**
 * Get event history for a specific item
 */
export async function getItemEventHistory(
  itemId: string,
  filter?: EventFilter
): Promise<EventHistoryList> {
  return apiClient.get<EventHistoryList>(`/events/items/${itemId}`, {
    params: filter ? { ...filter } : undefined,
  })
}

/**
 * Export event history as JSON
 */
export async function exportEventHistory(
  householdId: string,
  filter?: EventFilter
): Promise<Blob> {
  const events = await getEvents(householdId, filter)
  const json = JSON.stringify(events, null, 2)
  return new Blob([json], { type: 'application/json' })
}
