'use client'

import { Component, ReactNode } from 'react'
import { useToast } from '@/components/ui/toast'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a user-friendly fallback UI.
 * Follows sNAKr tone guidelines: calm, no guilt, helpful.
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    // TODO: Send to error tracking service (e.g., Sentry) in production
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

/**
 * Default Error Fallback UI
 * 
 * Displays a calm, helpful error message following sNAKr tone guidelines.
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-16 bg-background">
      <div className="max-w-md w-full space-y-24">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <svg
              className="w-32 h-32 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-12">
          <h1 className="text-2xl font-semibold text-foreground">
            Something went sideways
          </h1>
          <div className="space-y-8">
            <p className="text-muted-foreground">
              We hit a snag while loading this page. This happens sometimes.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Technical details
                </summary>
                <pre className="mt-8 p-12 bg-muted rounded-lg text-xs overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-12">
          <button
            onClick={reset}
            className="w-full px-16 py-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-16 py-12 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
          >
            Go to home
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground">
          If this keeps happening, try refreshing the page or{' '}
          <a href="/contact" className="text-primary hover:underline">
            let us know
          </a>
          .
        </p>
      </div>
    </div>
  )
}

/**
 * Error Boundary Wrapper Component
 * 
 * Provides a simpler API for using the error boundary.
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

/**
 * Hook-based Error Boundary
 * 
 * For functional components that need to handle errors.
 * Note: This doesn't catch render errors, only errors in event handlers.
 */
export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = (error: unknown, context?: string) => {
    // Log error
    console.error('Error:', error, context)

    // Get error message
    let message = 'Something went wrong'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    // Show toast notification
    showToast(message, 'error')

    // TODO: Send to error tracking service in production
  }

  return { handleError }
}
