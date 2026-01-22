/**
 * Item API Endpoints
 * 
 * Functions for managing household items and inventory.
 */

import { apiClient } from '../client'
import type {
  ItemCreate,
  ItemUpdate,
  Item,
  ItemList,
  ItemSearchResult,
  Location,
  State,
  Category,
} from '../types'

// ============================================================================
// Item Management
// ============================================================================

/**
 * Create a new item
 */
export async function createItem(data: ItemCreate): Promise<any> {
  return apiClient.post<any>('/items', { body: data })
}

/**
 * Get all items for a household with optional filters
 */
export async function getItems(
  householdId: string,
  location?: Location,
  state?: State,
  category?: Category,
  sortBy?: 'name' | 'state' | 'last_updated',
  limit?: number,
  offset?: number
): Promise<any> {
  const params = new URLSearchParams({
    household_id: householdId,
  })
  
  if (location) params.append('location', location)
  if (state) params.append('state', state)
  if (category) params.append('category', category)
  if (sortBy) params.append('sort_by', sortBy)
  if (limit) params.append('limit', limit.toString())
  if (offset) params.append('offset', offset.toString())
  
  return apiClient.get<any>(`/items?${params.toString()}`)
}

/**
 * Get a specific item by ID
 */
export async function getItem(itemId: string): Promise<any> {
  return apiClient.get<any>(`/items/${itemId}`)
}

/**
 * Update an item
 */
export async function updateItem(
  itemId: string,
  data: ItemUpdate
): Promise<any> {
  return apiClient.patch<any>(`/items/${itemId}`, { body: data })
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string): Promise<void> {
  await apiClient.delete(`/items/${itemId}`)
}

/**
 * Search items by name (fuzzy search)
 */
export async function searchItems(
  householdId: string,
  query: string,
  limit?: number
): Promise<any> {
  const params = new URLSearchParams({
    household_id: householdId,
    q: query,
  })
  
  if (limit) params.append('limit', limit.toString())
  
  return apiClient.get<any>(`/items/search?${params.toString()}`)
}
