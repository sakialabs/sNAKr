import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/error-boundary'
import { HouseholdProvider } from '@/lib/contexts/household-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'sNAKr - Shared Household Inventory Intelligence',
  description: 'Track your household inventory with receipt ingestion and smart predictions',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <HouseholdProvider>
              {children}
            </HouseholdProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}


