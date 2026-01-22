'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-button focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-grape-primary text-white hover:bg-grape-deep active:bg-grape-shadow shadow-[0_6px_20px_rgba(106,51,168,0.25)] hover:shadow-[0_8px_24px_rgba(106,51,168,0.35)] active:scale-[0.98]',
      secondary: 'bg-transparent border border-grape-primary text-grape-primary hover:bg-grape-primary/10 active:scale-[0.98]',
      ghost: 'bg-grape-primary/[0.03] hover:bg-grape-primary/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] active:scale-[0.98]',
      outline: 'border border-input bg-background hover:bg-grape-primary/[0.06] dark:hover:bg-white/[0.06] active:scale-[0.98]',
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
