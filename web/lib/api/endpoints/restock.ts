/**
 * Restock API Endpoints
 * 
 * Functions for managing restock lists and Nimbly integration.
 */

import { apiClient } from '../client'
import type {
  RestockDismiss,
  RestockFilter,
  RestockList,
  RestockExportResponse,
  RestockIntent,
  ActionOptionsResponse,
  SuccessResponse,
} from '../types'

// ============================================================================
// Restock List
// ============================================================================

/**
 * Get restock list for a household
 */
export async function getRestockList(
  householdId: string,
  filter?: RestockFilter
): Promise<RestockList> {
  return apiClient.get<RestockList>('/restock', {
    params: { household_id: householdId, ...filter },
  })
}

/**
 * Dismiss an item from the restock list
 */
export async function dismissRestockItem(
  itemId: string,
  data: RestockDismiss
): Promise<SuccessResponse> {
  return apiClient.post<SuccessResponse>(`/restock/${itemId}/dismiss`, { body: data })
}

/**
 * Export restock list
 */
export async function exportRestockList(
  householdId: string,
  format: 'text' | 'json' = 'text'
): Promise<RestockExportResponse> {
  return apiClient.post<RestockExportResponse>('/restock/export', {
    body: { household_id: householdId, format },
  })
}

// ============================================================================
// Nimbly Integration (Phase 3)
// ============================================================================

/**
 * Generate a Restock Intent for Nimbly
 */
export async function generateRestockIntent(householdId: string): Promise<RestockIntent> {
  return apiClient.post<RestockIntent>('/restock/intent', {
    body: { household_id: householdId },
  })
}

/**
 * Get a specific Restock Intent
 */
export async function getRestockIntent(intentId: string): Promise<RestockIntent> {
  return apiClient.get<RestockIntent>(`/restock/intent/${intentId}`)
}

/**
 * Initiate handoff to Nimbly
 */
export async function handoffToNimbly(
  intentId: string,
  approved: boolean
): Promise<SuccessResponse> {
  return apiClient.post<SuccessResponse>(`/restock/intent/${intentId}/handoff`, {
    body: { intent_id: intentId, approved },
  })
}

/**
 * Receive Action Options from Nimbly
 */
export async function receiveActionOptions(intentId: string): Promise<ActionOptionsResponse> {
  return apiClient.get<ActionOptionsResponse>(`/restock/intent/${intentId}/response`)
}
