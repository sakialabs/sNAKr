/**
 * Item API Endpoints
 * 
 * Functions for managing items and inventory.
 */

import { apiClient } from '../client'
import type {
  ItemCreate,
  ItemUpdate,
  ItemSearch,
  Item,
  ItemList,
  ItemSearchResult,
  InventoryFilter,
  InventoryList,
  QuickAction,
  QuickActionResponse,
  InventoryStateUpdate,
  Inventory,
  SuccessResponse,
} from '../types'

// ============================================================================
// Item Management
// ============================================================================

/**
 * Create a new item
 */
export async function createItem(householdId: string, data: ItemCreate): Promise<Item> {
  return apiClient.post<Item>('/items', {
    body: { ...data, household_id: householdId },
  })
}

/**
 * Get all items for a household
 */
export async function getItems(householdId: string): Promise<ItemList> {
  return apiClient.get<ItemList>('/items', {
    params: { household_id: householdId },
  })
}

/**
 * Get a specific item by ID
 */
export async function getItem(itemId: string): Promise<Item> {
  return apiClient.get<Item>(`/items/${itemId}`)
}

/**
 * Update an item
 */
export async function updateItem(itemId: string, data: ItemUpdate): Promise<Item> {
  return apiClient.patch<Item>(`/items/${itemId}`, { body: data })
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string): Promise<SuccessResponse> {
  return apiClient.delete<SuccessResponse>(`/items/${itemId}`)
}

/**
 * Search items by name
 */
export async function searchItems(
  householdId: string,
  data: ItemSearch
): Promise<ItemSearchResult> {
  return apiClient.post<ItemSearchResult>('/items/search', {
    body: { ...data, household_id: householdId },
  })
}

// ============================================================================
// Inventory Management
// ============================================================================

/**
 * Get inventory for a household
 */
export async function getInventory(
  householdId: string,
  filter?: InventoryFilter
): Promise<InventoryList> {
  return apiClient.get<InventoryList>('/items/inventory', {
    params: { household_id: householdId, ...filter },
  })
}

/**
 * Update inventory state manually
 */
export async function updateInventoryState(
  itemId: string,
  data: InventoryStateUpdate
): Promise<Inventory> {
  return apiClient.patch<Inventory>(`/items/${itemId}/state`, { body: data })
}

// ============================================================================
// Quick Actions
// ============================================================================

/**
 * Mark item as used
 */
export async function markItemUsed(itemId: string): Promise<QuickActionResponse> {
  return apiClient.post<QuickActionResponse>(`/items/${itemId}/used`)
}

/**
 * Mark item as restocked
 */
export async function markItemRestocked(itemId: string): Promise<QuickActionResponse> {
  return apiClient.post<QuickActionResponse>(`/items/${itemId}/restocked`)
}

/**
 * Mark item as ran out
 */
export async function markItemRanOut(itemId: string): Promise<QuickActionResponse> {
  return apiClient.post<QuickActionResponse>(`/items/${itemId}/ran_out`)
}

/**
 * Perform a quick action on an item
 */
export async function performQuickAction(
  itemId: string,
  action: QuickAction
): Promise<QuickActionResponse> {
  switch (action.action) {
    case 'used':
      return markItemUsed(itemId)
    case 'restocked':
      return markItemRestocked(itemId)
    case 'ran_out':
      return markItemRanOut(itemId)
    default:
      throw new Error(`Unknown action: ${action.action}`)
  }
}
