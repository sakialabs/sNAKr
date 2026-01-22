import { Alert } from 'react-native';

/**
 * Error Handling Utilities
 * 
 * Provides consistent error handling following sNAKr tone guidelines:
 * - Calm, no guilt, helpful
 * - Clear next steps
 * - No technical jargon in user-facing messages
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Format API error for user display
 */
export function formatAPIError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;

    // Map common error messages to friendly versions
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return 'Session expired. Sign in again to continue.';
    }
    if (message.includes('not found')) {
      return "We couldn't find that. It might have been deleted.";
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Double-check your input and try again.';
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return "You don't have access to that.";
    }
    if (message.includes('rate limit')) {
      return 'Slow down a bit. Try again in a moment.';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'Connection hiccup. Check your internet and try again.';
    }
    if (message.includes('server') || message.includes('500')) {
      return "Our servers are having a moment. Try again soon.";
    }

    // Return the message if it's already user-friendly
    if (!message.match(/error|exception|stack|undefined|null/i)) {
      return message;
    }
  }

  return 'Something went sideways. Try again?';
}

/**
 * Show error alert
 */
export function showErrorAlert(error: unknown, title: string = 'Error') {
  const message = formatAPIError(error);
  Alert.alert(title, message);
}

/**
 * Show success alert
 */
export function showSuccessAlert(message: string, title: string = 'Success') {
  Alert.alert(title, message);
}

/**
 * Show confirmation dialog
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
      },
    ]
  );
}

/**
 * Log error (development only)
 */
export function logError(error: unknown, context?: string) {
  if (__DEV__) {
    console.error('Error:', context, error);
  }
  // TODO: Send to error tracking service (e.g., Sentry) in production
}

/**
 * Handle async errors with user feedback
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    logError(error, errorMessage);
    if (errorMessage) {
      showErrorAlert(error, 'Error');
    }
    return [null, error as Error];
  }
}
