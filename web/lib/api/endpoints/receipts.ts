/**
 * Receipt API Endpoints
 * 
 * Functions for uploading, processing, and confirming receipts.
 */

import { apiClient } from '../client'
import type {
  ReceiptConfirmation,
  ReceiptFilter,
  Receipt,
  ReceiptWithItems,
  ReceiptList,
  ReceiptUploadResponse,
  ReceiptConfirmationResponse,
  SuccessResponse,
} from '../types'

// ============================================================================
// Receipt Upload
// ============================================================================

/**
 * Upload a receipt file
 */
export async function uploadReceipt(
  householdId: string,
  file: File,
  idempotencyKey?: string
): Promise<ReceiptUploadResponse> {
  return apiClient.uploadFile<ReceiptUploadResponse>(
    '/receipts',
    file,
    { household_id: householdId },
    { idempotencyKey }
  )
}

// ============================================================================
// Receipt Management
// ============================================================================

/**
 * Get all receipts for a household
 */
export async function getReceipts(
  householdId: string,
  filter?: ReceiptFilter
): Promise<ReceiptList> {
  return apiClient.get<ReceiptList>('/receipts', {
    params: { household_id: householdId, ...filter },
  })
}

/**
 * Get a specific receipt by ID
 */
export async function getReceipt(receiptId: string): Promise<ReceiptWithItems> {
  return apiClient.get<ReceiptWithItems>(`/receipts/${receiptId}`)
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(receiptId: string): Promise<SuccessResponse> {
  return apiClient.delete<SuccessResponse>(`/receipts/${receiptId}`)
}

// ============================================================================
// Receipt Confirmation
// ============================================================================

/**
 * Confirm receipt items and apply to inventory
 */
export async function confirmReceipt(
  receiptId: string,
  data: ReceiptConfirmation,
  idempotencyKey?: string
): Promise<ReceiptConfirmationResponse> {
  return apiClient.post<ReceiptConfirmationResponse>(`/receipts/${receiptId}/confirm`, {
    body: data,
    idempotencyKey,
  })
}

/**
 * Get receipt status
 */
export async function getReceiptStatus(receiptId: string): Promise<Receipt> {
  return apiClient.get<Receipt>(`/receipts/${receiptId}/status`)
}
