/**
 * Toast Notification Utilities
 * 
 * Provides helper functions for showing toast notifications with sNAKr tone.
 * Follows guidelines: calm, no guilt, helpful, minimal.
 */

import { useToast } from '@/components/ui/toast'

/**
 * Toast notification helpers
 * 
 * These functions provide a consistent way to show notifications
 * throughout the app, following sNAKr tone guidelines.
 */

/**
 * Show a success toast
 * Use for: completed actions, confirmations
 * Tone: warm, affirming, brief
 */
export function showSuccess(message: string, toast: ReturnType<typeof useToast>) {
  toast.showToast(message, 'success')
}

/**
 * Show an error toast
 * Use for: failed actions, validation errors
 * Tone: calm, helpful, no blame
 * 
 * Error messages should follow the structure:
 * - What happened
 * - What to do next (optional)
 * 
 * Good: "Upload failed. Try a clearer photo."
 * Bad: "Error: Invalid file format"
 */
export function showError(message: string, toast: ReturnType<typeof useToast>) {
  toast.showToast(message, 'error')
}

/**
 * Show an info toast
 * Use for: neutral updates, status changes
 * Tone: factual, calm, brief
 */
export function showInfo(message: string, toast: ReturnType<typeof useToast>) {
  toast.showToast(message, 'info')
}

/**
 * Show a warning toast
 * Use for: important notices, potential issues
 * Tone: calm, clear, no alarm
 */
export function showWarning(message: string, toast: ReturnType<typeof useToast>) {
  toast.showToast(message, 'warning')
}

/**
 * Common toast messages following sNAKr tone
 */
export const ToastMessages = {
  // Success messages
  success: {
    saved: 'Saved',
    updated: 'Updated',
    deleted: 'Deleted',
    created: 'Created',
    copied: 'Copied to clipboard',
    invited: 'Invite sent',
    joined: 'Welcome to the household',
  },

  // Error messages (calm, helpful, no blame)
  error: {
    generic: 'Something went sideways. Try again?',
    network: 'Connection hiccup. Check your internet and try again.',
    auth: 'Session expired. Sign in again to continue.',
    notFound: 'We couldn\'t find that. It might have been deleted.',
    validation: 'Double-check your input and try again.',
    upload: 'Upload failed. Try a clearer photo or smaller file.',
    permission: 'You don\'t have access to that.',
    rateLimit: 'Slow down a bit. Try again in a moment.',
    server: 'Our servers are having a moment. Try again soon.',
  },

  // Info messages
  info: {
    processing: 'Processing...',
    loading: 'Loading...',
    saving: 'Saving...',
    uploading: 'Uploading...',
  },

  // Warning messages
  warning: {
    unsavedChanges: 'You have unsaved changes',
    lowConfidence: 'We\'re not super confident about this one',
    experimental: 'This feature is experimental',
  },
}

/**
 * Format API error for toast display
 * 
 * Converts technical API errors into user-friendly messages
 * following sNAKr tone guidelines.
 */
export function formatAPIError(error: unknown): string {
  // Handle API errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message

    // Map common error messages to friendly versions
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return ToastMessages.error.auth
    }
    if (message.includes('not found')) {
      return ToastMessages.error.notFound
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ToastMessages.error.validation
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return ToastMessages.error.permission
    }
    if (message.includes('rate limit')) {
      return ToastMessages.error.rateLimit
    }
    if (message.includes('network') || message.includes('connection')) {
      return ToastMessages.error.network
    }
    if (message.includes('server') || message.includes('500')) {
      return ToastMessages.error.server
    }

    // Return the message if it's already user-friendly
    // (doesn't contain technical jargon)
    if (!message.match(/error|exception|stack|undefined|null/i)) {
      return message
    }
  }

  // Default fallback
  return ToastMessages.error.generic
}

/**
 * Show API error toast
 * 
 * Convenience function for handling API errors.
 */
export function showAPIError(error: unknown, toast: ReturnType<typeof useToast>) {
  const message = formatAPIError(error)
  showError(message, toast)
}

/**
 * Hook for toast utilities
 * 
 * Provides all toast helper functions in one hook.
 */
export function useToastHelpers() {
  const toast = useToast()

  return {
    showSuccess: (message: string) => showSuccess(message, toast),
    showError: (message: string) => showError(message, toast),
    showInfo: (message: string) => showInfo(message, toast),
    showWarning: (message: string) => showWarning(message, toast),
    showAPIError: (error: unknown) => showAPIError(error, toast),
    messages: ToastMessages,
  }
}
