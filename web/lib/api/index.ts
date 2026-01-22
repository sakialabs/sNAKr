/**
 * sNAKr API Client
 * 
 * Main entry point for all API interactions.
 * 
 * Usage:
 * ```typescript
 * import { api } from '@/lib/api'
 * 
 * // Households
 * const households = await api.households.getHouseholds()
 * const household = await api.households.createHousehold({ name: 'My Home' })
 * 
 * // Items
 * const items = await api.items.getItems(householdId)
 * await api.items.markItemUsed(itemId)
 * 
 * // Receipts
 * const receipt = await api.receipts.uploadReceipt(householdId, file)
 * await api.receipts.confirmReceipt(receiptId, confirmationData)
 * 
 * // Restock
 * const restockList = await api.restock.getRestockList(householdId)
 * 
 * // Events
 * const events = await api.events.getEvents(householdId)
 * ```
 * 
 * Error Handling:
 * ```typescript
 * import { api, isAPIError, getErrorMessage } from '@/lib/api'
 * 
 * try {
 *   await api.items.createItem(householdId, itemData)
 * } catch (error) {
 *   if (isAPIError(error)) {
 *     console.error('API Error:', error.statusCode, error.message)
 *   } else {
 *     console.error('Unknown Error:', getErrorMessage(error))
 *   }
 * }
 * ```
 */

// Export client and utilities
export { apiClient, isAPIError, getErrorMessage, isAuthenticated } from './client'

// Export error classes
export {
  APIError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from './client'

// Export all types
export * from './types'

// Import endpoint modules
import * as households from './endpoints/households'
import * as items from './endpoints/items'
import * as receipts from './endpoints/receipts'
import * as events from './endpoints/events'
import * as restock from './endpoints/restock'

// Export organized API object
export const api = {
  households,
  items,
  receipts,
  events,
  restock,
}

// Export individual endpoint modules for tree-shaking
export { households, items, receipts, events, restock }
