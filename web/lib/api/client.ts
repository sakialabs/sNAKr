/**
 * API Client for sNAKr Backend
 * 
 * This module provides a type-safe API client for communicating with the FastAPI backend.
 * Features:
 * - Automatic JWT token injection from Supabase
 * - Request/response type safety
 * - Error handling and normalization
 * - Support for all HTTP methods (GET, POST, PATCH, DELETE)
 * - File upload support
 * - Idempotency key support
 */

import { createClient } from '@/lib/supabase/client'
import type { ErrorResponse } from './types'

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_VERSION = 'v1'
const API_PREFIX = `/api/${API_VERSION}`

// Health check state
let lastHealthCheck: { timestamp: number; isHealthy: boolean } | null = null
const HEALTH_CHECK_CACHE_MS = 30000 // Cache health check for 30 seconds

// ============================================================================
// Error Classes
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public detail?: Record<string, unknown>,
    public path?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, detail?: Record<string, unknown>) {
    super(message, 400, detail)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

export class ServerError extends APIError {
  constructor(message: string = 'Internal server error') {
    super(message, 500)
    this.name = 'ServerError'
  }
}

// ============================================================================
// Request Options
// ============================================================================

export interface RequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  formData?: FormData
  idempotencyKey?: string
  signal?: AbortSignal
  skipAuth?: boolean
}

// ============================================================================
// API Client Class
// ============================================================================

class APIClient {
  private baseURL: string
  private apiPrefix: string

  constructor(baseURL: string = API_BASE_URL, apiPrefix: string = API_PREFIX) {
    this.baseURL = baseURL
    this.apiPrefix = apiPrefix
  }

  /**
   * Check if the API server is healthy
   */
  private async checkHealth(): Promise<boolean> {
    // Return cached result if recent
    if (lastHealthCheck && Date.now() - lastHealthCheck.timestamp < HEALTH_CHECK_CACHE_MS) {
      return lastHealthCheck.isHealthy
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const isHealthy = response.ok

      lastHealthCheck = {
        timestamp: Date.now(),
        isHealthy,
      }

      return isHealthy
    } catch {
      lastHealthCheck = {
        timestamp: Date.now(),
        isHealthy: false,
      }
      return false
    }
  }

  /**
   * Get the full URL for an endpoint
   */
  private getURL(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.apiPrefix}${endpoint}`, this.baseURL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  /**
   * Get authentication token from Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * Build request headers
   */
  private async buildHeaders(
    options: RequestOptions = {},
    isFormData: boolean = false
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...options.headers,
    }

    // Add Content-Type for JSON requests (not for FormData)
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // Add authentication token (unless skipAuth is true)
    if (!options.skipAuth) {
      const token = await this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Add idempotency key if provided
    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey
    }

    return headers
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Check if response is ok
    if (!response.ok) {
      await this.handleErrorResponse(response)
    }

    // Parse JSON response
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    // Return empty object for non-JSON responses
    return {} as T
  }

  /**
   * Handle error response
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ErrorResponse | null = null

    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json()
      }
    } catch {
      // Failed to parse error response
    }

    const message = errorData?.error || response.statusText || 'An error occurred'
    const detail = errorData?.detail
    const path = errorData?.path

    // Throw specific error based on status code
    switch (response.status) {
      case 401:
        throw new AuthenticationError(message)
      case 403:
        throw new AuthorizationError(message)
      case 404:
        throw new NotFoundError(message)
      case 400:
        throw new ValidationError(message, detail)
      case 429:
        throw new RateLimitError(message)
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message)
      default:
        throw new APIError(message, response.status, detail, path)
    }
  }

  /**
   * Make a request to the API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, body, formData, signal } = options
    const isFormData = !!formData

    const url = this.getURL(endpoint, params)
    const headers = await this.buildHeaders(options, isFormData)

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal,
    }

    // Add body for POST, PATCH, PUT requests
    if (formData) {
      fetchOptions.body = formData
    } else if (body) {
      fetchOptions.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, fetchOptions)
      return await this.handleResponse<T>(response)
    } catch (error) {
      // Re-throw API errors
      if (error instanceof APIError) {
        throw error
      }

      // Handle network errors - check if server is down
      if (error instanceof TypeError) {
        // Try health check to provide better error message
        const isHealthy = await this.checkHealth()
        if (!isHealthy) {
          throw new ServerError(
            'The backend server is not responding. Please make sure it is running on port 8000.'
          )
        }
        throw new ServerError('Network error: Unable to connect to server')
      }

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request cancelled', 0)
      }

      // Handle unknown errors
      throw new ServerError('An unexpected error occurred')
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, options)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, options)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, options)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, options)
  }

  /**
   * Upload file
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    options: RequestOptions = {}
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.request<T>('POST', endpoint, {
      ...options,
      formData,
    })
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const apiClient = new APIClient()

// ============================================================================
// Convenience functions
// ============================================================================

/**
 * Check if error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    // Make server not responding errors more user-friendly
    if (error.message.includes('not responding') || error.message.includes('make sure it is running')) {
      return "The backend server isn't running. Please start it and refresh the page."
    }
    
    // Make network errors more user-friendly
    if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
      return "We're having trouble connecting to the server. Please check your connection and try again."
    }
    
    // Make RLS errors more user-friendly
    if (error.message.includes('row-level security') || error.message.includes('RLS')) {
      return "We couldn't complete that action right now. Please try again or contact support if the issue persists."
    }
    
    return error.message
  }
  
  if (error instanceof Error) {
    // Make network errors more user-friendly
    if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
      return "We're having trouble connecting to the server. Please check your connection and try again."
    }
    
    return error.message
  }
  
  return 'An unexpected error occurred'
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}
