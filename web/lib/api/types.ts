/**
 * TypeScript types for API requests and responses
 * 
 * These types mirror the Pydantic models from the FastAPI backend.
 * They provide type safety for API calls throughout the application.
 */

// ============================================================================
// Common Types and Enums
// ============================================================================

export enum State {
  PLENTY = 'plenty',
  OK = 'ok',
  LOW = 'low',
  ALMOST_OUT = 'almost_out',
  OUT = 'out',
}

export enum Category {
  DAIRY = 'dairy',
  PRODUCE = 'produce',
  MEAT = 'meat',
  BAKERY = 'bakery',
  PANTRY_STAPLE = 'pantry_staple',
  BEVERAGE = 'beverage',
  SNACK = 'snack',
  CONDIMENT = 'condiment',
  OTHER = 'other',
}

export enum Location {
  FRIDGE = 'fridge',
  PANTRY = 'pantry',
  FREEZER = 'freezer',
}

export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum EventType {
  INVENTORY_USED = 'inventory.used',
  INVENTORY_RESTOCKED = 'inventory.restocked',
  INVENTORY_RAN_OUT = 'inventory.ran_out',
  RECEIPT_INGESTED = 'receipt.ingested',
  RECEIPT_CONFIRMED = 'receipt.confirmed',
}

export enum EventSource {
  USER_ACTION = 'user_action',
  RECEIPT_CONFIRMATION = 'receipt_confirmation',
  PREDICTION = 'prediction',
  IOT_DEVICE = 'iot_device',
}

export enum ReceiptStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PARSED = 'parsed',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum Urgency {
  NEED_NOW = 'need_now',
  NEED_SOON = 'need_soon',
  NICE_TO_TOP_UP = 'nice_to_top_up',
}

// ============================================================================
// Error Response
// ============================================================================

export interface ErrorResponse {
  error: string
  detail?: Record<string, unknown>
  path?: string
}

export interface SuccessResponse {
  message: string
  data?: Record<string, unknown>
}

// ============================================================================
// Household Types
// ============================================================================

export interface HouseholdCreate {
  name: string
}

export interface HouseholdUpdate {
  name?: string
}

export interface MemberInvite {
  email: string
  role?: Role
}

export interface MemberRoleUpdate {
  role: Role
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: Role
  joined_at: string
  email?: string
  name?: string
}

export interface Household {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface HouseholdDetail extends Household {
  members: HouseholdMember[]
  member_count: number
  admin_count: number
}

export interface HouseholdList {
  households: Household[]
  total: number
}

export interface InviteResponse {
  message: string
  invite_id: string
  expires_at: string
}

// ============================================================================
// Invitation Types
// ============================================================================

export interface Invitation {
  id: string
  household_id: string
  household_name?: string
  inviter_id: string
  invitee_email: string
  role: 'member' | 'admin'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  token: string
  expires_at: string
  accepted_at?: string
  created_at: string
  updated_at: string
}

export interface InvitationList {
  invitations: Invitation[]
  total: number
}

export interface InvitationAcceptResponse {
  message: string
  household_id: string
  household_name: string
  role: string
}

// ============================================================================
// Item Types
// ============================================================================

export interface ItemCreate {
  household_id: string
  name: string
  category: Category
  location: Location
}

export interface ItemUpdate {
  name?: string
  category?: Category
  location?: Location
}

export interface ItemSearch {
  query: string
  limit?: number
}

export interface Item {
  id: string
  household_id: string
  name: string
  category: Category
  location: Location
  created_at: string
  updated_at: string
}

export interface ItemWithSimilarity extends Item {
  similarity_score: number
}

export interface ItemList {
  items: Item[]
  total: number
}

export interface ItemSearchResult {
  items: ItemWithSimilarity[]
  total: number
}

// ============================================================================
// Inventory Types
// ============================================================================

export interface InventoryStateUpdate {
  state: State
}

export interface QuickAction {
  action: 'used' | 'restocked' | 'ran_out'
}

export interface InventoryFilter {
  location?: Location
  state?: State
  sort_by?: 'name' | 'state' | 'last_updated'
  limit?: number
  offset?: number
}

export interface Inventory {
  id: string
  household_id: string
  item_id: string
  state: State
  confidence: number
  last_updated: string
  created_at: string
  updated_at: string
}

export interface InventoryWithItem extends Inventory {
  item: Item
}

export interface InventoryList {
  inventory: InventoryWithItem[]
  total: number
}

export interface QuickActionResponse {
  message: string
  inventory: Inventory
  event_id: string
}

// ============================================================================
// Event Types
// ============================================================================

export interface EventCreate {
  household_id: string
  event_type: EventType
  source: EventSource
  item_id?: string
  payload?: Record<string, unknown>
  confidence?: number
}

export interface EventFilter {
  event_type?: EventType
  item_id?: string
  source?: EventSource
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface Event {
  id: string
  household_id: string
  event_type: EventType
  source: EventSource
  item_id?: string
  payload?: Record<string, unknown>
  confidence: number
  created_at: string
}

export interface EventList {
  events: Event[]
  total: number
}

export interface EventHistory extends Event {
  item?: Item
}

export interface EventHistoryList {
  events: EventHistory[]
  total: number
}

// ============================================================================
// Receipt Types
// ============================================================================

export interface ReceiptUpload {
  file: File
  idempotency_key?: string
}

export interface ReceiptItemConfirmation {
  receipt_item_id: string
  confirmed: boolean
  mapped_item_id?: string
  edited_name?: string
}

export interface ReceiptConfirmation {
  items: ReceiptItemConfirmation[]
}

export interface ReceiptFilter {
  status?: ReceiptStatus
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface MappingCandidate {
  item_id: string
  item_name: string
  match_score: number
}

export interface ReceiptItem {
  id: string
  receipt_id: string
  raw_name: string
  normalized_name: string
  quantity: number
  unit?: string
  price?: number
  confidence: number
  suggested_mapping?: MappingCandidate
  alternative_mappings: MappingCandidate[]
  status: string
  created_at: string
}

export interface Receipt {
  id: string
  household_id: string
  file_url: string
  status: ReceiptStatus
  store_name?: string
  receipt_date?: string
  total_amount?: number
  ocr_text?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface ReceiptWithItems extends Receipt {
  items: ReceiptItem[]
}

export interface ReceiptList {
  receipts: Receipt[]
  total: number
}

export interface ReceiptUploadResponse {
  message: string
  receipt_id: string
  status: ReceiptStatus
}

export interface ReceiptConfirmationResponse {
  message: string
  receipt_id: string
  confirmed_items: number
  skipped_items: number
  events_created: number
}

// ============================================================================
// Prediction Types
// ============================================================================

export interface PredictionFilter {
  item_id?: string
  min_confidence?: number
  limit?: number
  offset?: number
}

export interface PredictionRefresh {
  item_id?: string
}

export interface ReasonCode {
  code: string
  description: string
}

export interface Prediction {
  id: string
  household_id: string
  item_id: string
  predicted_state: State
  confidence: number
  days_to_low?: number
  days_to_out?: number
  model_version: string
  created_at: string
  updated_at: string
}

export interface PredictionWithItem extends Prediction {
  item: Item
  reason_codes: ReasonCode[]
}

export interface PredictionWithReasons extends Prediction {
  reason_codes: ReasonCode[]
}

export interface PredictionList {
  predictions: PredictionWithItem[]
  total: number
}

export interface PredictionRefreshResponse {
  message: string
  predictions_updated: number
}

export interface ConfidenceGating {
  high_threshold: number
  medium_threshold: number
  low_threshold: number
}

// ============================================================================
// Restock Types
// ============================================================================

export interface RestockDismiss {
  item_id: string
  duration_days?: number
}

export interface RestockFilter {
  urgency?: Urgency
  limit?: number
  offset?: number
}

export interface RestockExport {
  format: 'text' | 'json'
}

export interface RestockIntentGenerate {
  household_id: string
}

export interface RestockItem {
  id: string
  household_id: string
  item_id: string
  urgency: Urgency
  reason: string
  predicted_days_to_out?: number
  dismissed_until?: string
  created_at: string
  updated_at: string
}

export interface RestockItemWithDetails extends RestockItem {
  item: Item
  inventory: Inventory
  prediction?: Prediction
}

export interface RestockList {
  need_now: RestockItemWithDetails[]
  need_soon: RestockItemWithDetails[]
  nice_to_top_up: RestockItemWithDetails[]
  total: number
}

export interface RestockExportResponse {
  format: string
  content: string
}

export interface RestockIntentItem {
  canonical_name: string
  category: Category
  current_state: State
  confidence: number
  reason_codes: string[]
  suggested_quantity: number
  quantity_confidence: number
}

export interface RestockIntentConstraints {
  partial_fulfillment_allowed: boolean
  local_first_preference: 'neutral' | 'prefer' | 'required'
  budget_sensitivity: 'low' | 'medium' | 'high'
}

export interface RestockIntent {
  intent_id: string
  version: string
  household_id: string
  generated_at: string
  overall_urgency: 'low' | 'medium' | 'high'
  items: RestockIntentItem[]
  constraints: RestockIntentConstraints
}

export interface ActionOption {
  option_id: string
  timing: string
  expected_benefit: string
  confidence: number
  reasoning: string[]
}

export interface ActionOptionsResponse {
  intent_id: string
  options: ActionOption[]
}

export interface RestockIntentHandoff {
  intent_id: string
  approved: boolean
}
