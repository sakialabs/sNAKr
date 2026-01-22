/**
 * Supabase Database Types
 * 
 * This file contains TypeScript types for the Supabase database schema.
 * These types should be generated from your Supabase schema using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 * 
 * For now, we'll define basic types manually.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          household_id: string
          name: string
          category: string
          location: 'fridge' | 'pantry' | 'freezer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          category: string
          location: 'fridge' | 'pantry' | 'freezer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          category?: string
          location?: 'fridge' | 'pantry' | 'freezer'
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          household_id: string
          item_id: string
          state: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
          confidence: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          item_id: string
          state: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
          confidence?: number
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          item_id?: string
          state?: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
          confidence?: number
          last_updated?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          household_id: string
          item_id: string | null
          event_type: string
          payload: Json
          source: string
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          item_id?: string | null
          event_type: string
          payload: Json
          source: string
          confidence?: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          item_id?: string | null
          event_type?: string
          payload?: Json
          source?: string
          confidence?: number
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          household_id: string
          file_path: string
          status: 'uploaded' | 'processing' | 'parsed' | 'confirmed' | 'failed'
          raw_ocr_text: string | null
          store_name: string | null
          receipt_date: string | null
          total_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          file_path: string
          status?: 'uploaded' | 'processing' | 'parsed' | 'confirmed' | 'failed'
          raw_ocr_text?: string | null
          store_name?: string | null
          receipt_date?: string | null
          total_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          file_path?: string
          status?: 'uploaded' | 'processing' | 'parsed' | 'confirmed' | 'failed'
          raw_ocr_text?: string | null
          store_name?: string | null
          receipt_date?: string | null
          total_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      receipt_items: {
        Row: {
          id: string
          receipt_id: string
          raw_name: string
          normalized_name: string | null
          quantity: number
          unit: string | null
          price: number | null
          confidence: number
          suggested_item_id: string | null
          match_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          raw_name: string
          normalized_name?: string | null
          quantity: number
          unit?: string | null
          price?: number | null
          confidence?: number
          suggested_item_id?: string | null
          match_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          raw_name?: string
          normalized_name?: string | null
          quantity?: number
          unit?: string | null
          price?: number | null
          confidence?: number
          suggested_item_id?: string | null
          match_score?: number | null
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          household_id: string
          item_id: string
          predicted_state: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
          confidence: number
          days_to_low: number | null
          days_to_out: number | null
          reason_codes: string[]
          model_version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          item_id: string
          predicted_state: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
          confidence: number
          days_to_low?: number | null
          days_to_out?: number | null
          reason_codes: string[]
          model_version: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          item_id?: string
          predicted_state?: 'plenty' | 'ok' | 'low' | 'almost_out' | 'out'
          confidence?: number
          days_to_low?: number | null
          days_to_out?: number | null
          reason_codes?: string[]
          model_version?: string
          created_at?: string
          updated_at?: string
        }
      }
      restock_list: {
        Row: {
          id: string
          household_id: string
          item_id: string
          urgency: 'need_now' | 'need_soon' | 'nice_to_top_up'
          reason: string
          dismissed_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          item_id: string
          urgency: 'need_now' | 'need_soon' | 'nice_to_top_up'
          reason: string
          dismissed_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          item_id?: string
          urgency?: 'need_now' | 'need_soon' | 'nice_to_top_up'
          reason?: string
          dismissed_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
