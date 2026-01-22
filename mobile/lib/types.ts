/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions for the mobile app.
 */

import { ItemState, ItemLocation, ItemCategory, EventType, ReceiptStatusType, RestockUrgencyType } from './constants';

// User Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Household Types
export interface Household {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

// Item Types
export interface Item {
  id: string;
  household_id: string;
  name: string;
  category: ItemCategory;
  location: ItemLocation;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem extends Item {
  state: ItemState;
  confidence: number;
  last_updated: string;
  last_event_id?: string;
}

// Event Types
export interface Event {
  id: string;
  household_id: string;
  item_id: string;
  type: EventType;
  source: 'user' | 'receipt' | 'prediction' | 'iot';
  payload: Record<string, any>;
  confidence: number;
  created_at: string;
}

// Receipt Types
export interface Receipt {
  id: string;
  household_id: string;
  file_path: string;
  status: ReceiptStatusType;
  store_name?: string;
  receipt_date?: string;
  total_amount?: number;
  ocr_text?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  raw_name: string;
  normalized_name: string;
  quantity: number;
  unit?: string;
  price?: number;
  confidence: number;
  mapping_candidates?: MappingCandidate[];
  created_at: string;
}

export interface MappingCandidate {
  item_id: string;
  item_name: string;
  match_score: number;
  match_type: 'embedding' | 'fuzzy' | 'exact';
}

// Prediction Types
export interface Prediction {
  id: string;
  item_id: string;
  predicted_state: ItemState;
  confidence: number;
  days_to_low?: number;
  days_to_out?: number;
  reason_codes: string[];
  model_version: string;
  created_at: string;
}

// Restock Types
export interface RestockItem {
  id: string;
  household_id: string;
  item_id: string;
  item_name: string;
  current_state: ItemState;
  urgency: RestockUrgencyType;
  reason: string;
  predicted_days_to_out?: number;
  dismissed_until?: string;
  created_at: string;
  updated_at: string;
}

export interface RestockList {
  need_now: RestockItem[];
  need_soon: RestockItem[];
  nice_to_top_up: RestockItem[];
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface CreateItemForm {
  name: string;
  category: ItemCategory;
  location: ItemLocation;
}

export interface UpdateItemForm {
  name?: string;
  category?: ItemCategory;
  location?: ItemLocation;
}

export interface CreateHouseholdForm {
  name: string;
}

// Filter Types
export interface InventoryFilters {
  location?: ItemLocation | 'all';
  state?: ItemState | 'all';
  sortBy?: 'name' | 'state' | 'last_updated';
  sortOrder?: 'asc' | 'desc';
}

export interface EventFilters {
  itemId?: string;
  type?: EventType;
  page?: number;
  limit?: number;
}

// Navigation Types
export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
};

export type TabsParamList = {
  index: undefined;
  restock: undefined;
  receipts: undefined;
  settings: undefined;
};
