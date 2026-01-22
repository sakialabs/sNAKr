'use client'

import { motion } from 'framer-motion'

export default function SettingsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-content mx-auto px-6 py-8"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, notification preferences, and household settings.
        </p>
      </motion.div>

      {/* Settings Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {/* Account Settings */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-grape-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Profile</p>
                <p className="text-sm text-muted-foreground">Update your name and email</p>
              </div>
              <button className="text-grape-primary hover:text-grape-deep transition-colors">
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Change your password</p>
              </div>
              <button className="text-grape-primary hover:text-grape-deep transition-colors">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account</p>
              </div>
              <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-grape-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
              </div>
              <button className="w-12 h-6 bg-grape-primary rounded-full relative transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Receipt Processing</p>
                <p className="text-sm text-muted-foreground">Updates when receipts are processed</p>
              </div>
              <button className="w-12 h-6 bg-muted rounded-full relative transition-colors">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Weekly Summary</p>
                <p className="text-sm text-muted-foreground">Weekly inventory summary email</p>
              </div>
              <button className="w-12 h-6 bg-muted rounded-full relative transition-colors">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-grape-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Preferences
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">English (US)</p>
              </div>
              <button className="text-grape-primary hover:text-grape-deep transition-colors">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Time Zone</p>
                <p className="text-sm text-muted-foreground">Auto-detect</p>
              </div>
              <button className="text-grape-primary hover:text-grape-deep transition-colors">
                Change
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
