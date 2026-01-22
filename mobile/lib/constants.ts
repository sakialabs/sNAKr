/**
 * App Constants
 * 
 * Centralized configuration and constants for the mobile app.
 */

// sNAKr Color Palette
export const Colors = {
  primary: {
    DEFAULT: '#4CAF50',
    dark: '#388E3C',
    light: '#81C784',
  },
  secondary: {
    DEFAULT: '#FF9800',
    dark: '#F57C00',
    light: '#FFB74D',
  },
  accent: {
    DEFAULT: '#2196F3',
    dark: '#1976D2',
    light: '#64B5F6',
  },
  state: {
    plenty: '#4CAF50',
    ok: '#8BC34A',
    low: '#FF9800',
    almostOut: '#FF5722',
    out: '#F44336',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Item States
export const ItemStates = {
  PLENTY: 'plenty',
  OK: 'ok',
  LOW: 'low',
  ALMOST_OUT: 'almost_out',
  OUT: 'out',
} as const;

export type ItemState = typeof ItemStates[keyof typeof ItemStates];

// Item Locations
export const ItemLocations = {
  FRIDGE: 'fridge',
  PANTRY: 'pantry',
  FREEZER: 'freezer',
} as const;

export type ItemLocation = typeof ItemLocations[keyof typeof ItemLocations];

// Item Categories
export const ItemCategories = {
  DAIRY: 'dairy',
  PRODUCE: 'produce',
  MEAT: 'meat',
  BAKERY: 'bakery',
  PANTRY_STAPLE: 'pantry_staple',
  BEVERAGE: 'beverage',
  SNACK: 'snack',
  CONDIMENT: 'condiment',
  OTHER: 'other',
} as const;

export type ItemCategory = typeof ItemCategories[keyof typeof ItemCategories];

// Event Types
export const EventTypes = {
  USED: 'inventory.used',
  RESTOCKED: 'inventory.restocked',
  RAN_OUT: 'inventory.ran_out',
  RECEIPT_INGESTED: 'receipt.ingested',
  RECEIPT_CONFIRMED: 'receipt.confirmed',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

// Receipt Status
export const ReceiptStatus = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  PARSED: 'parsed',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

export type ReceiptStatusType = typeof ReceiptStatus[keyof typeof ReceiptStatus];

// Restock Urgency
export const RestockUrgency = {
  NEED_NOW: 'need_now',
  NEED_SOON: 'need_soon',
  NICE_TO_TOP_UP: 'nice_to_top_up',
} as const;

export type RestockUrgencyType = typeof RestockUrgency[keyof typeof RestockUrgency];

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 3600000, // 1 hour
  INVENTORY_TTL: 300000, // 5 minutes
  RESTOCK_TTL: 600000, // 10 minutes
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  DAILY_REMINDER_HOUR: 9,
  DAILY_REMINDER_MINUTE: 0,
  MAX_PER_DAY: 1,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Dismissal Durations (in days)
export const DISMISSAL_DURATIONS = [3, 7, 14, 30];

// App Metadata
export const APP_METADATA = {
  NAME: 'sNAKr',
  VERSION: '1.0.0',
  DESCRIPTION: 'Shared household inventory intelligence',
};
