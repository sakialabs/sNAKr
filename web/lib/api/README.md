# sNAKr API Client

Type-safe API client for communicating with the sNAKr FastAPI backend.

## Features

- ✅ **Type Safety**: Full TypeScript support with types matching backend Pydantic models
- ✅ **Authentication**: Automatic JWT token injection from Supabase
- ✅ **Error Handling**: Comprehensive error classes with proper status codes
- ✅ **Request/Response**: Support for JSON, FormData, and file uploads
- ✅ **Idempotency**: Built-in support for idempotency keys
- ✅ **Abort Support**: Request cancellation via AbortSignal

## Installation

The API client is already set up in the project. No additional installation needed.

## Basic Usage

```typescript
import { api } from '@/lib/api'

// Get all households
const households = await api.households.getHouseholds()

// Create a new household
const household = await api.households.createHousehold({
  name: 'My Home'
})

// Get inventory
const inventory = await api.items.getInventory(householdId, {
  location: 'fridge',
  state: 'low'
})

// Mark item as used
await api.items.markItemUsed(itemId)

// Upload receipt
const receipt = await api.receipts.uploadReceipt(householdId, file)

// Get restock list
const restockList = await api.restock.getRestockList(householdId)
```

## Error Handling

The API client provides specific error classes for different scenarios:

```typescript
import { 
  api, 
  isAPIError, 
  getErrorMessage,
  AuthenticationError,
  ValidationError,
  NotFoundError 
} from '@/lib/api'

try {
  await api.items.createItem(householdId, itemData)
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Redirect to login
    router.push('/auth/login')
  } else if (error instanceof ValidationError) {
    // Show validation errors
    console.error('Validation failed:', error.detail)
  } else if (error instanceof NotFoundError) {
    // Show not found message
    console.error('Resource not found')
  } else if (isAPIError(error)) {
    // Generic API error
    console.error('API Error:', error.statusCode, error.message)
  } else {
    // Unknown error
    console.error('Error:', getErrorMessage(error))
  }
}
```

### Error Classes

- `APIError` - Base error class for all API errors
- `AuthenticationError` (401) - Missing or invalid authentication token
- `AuthorizationError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ValidationError` (400) - Request validation failed
- `RateLimitError` (429) - Rate limit exceeded
- `ServerError` (500+) - Internal server error

## Advanced Usage

### Request Cancellation

```typescript
const controller = new AbortController()

// Start request
const promise = api.items.getItems(householdId, {
  signal: controller.signal
})

// Cancel request
controller.abort()
```

### Idempotency Keys

For operations that should be idempotent (like receipt uploads):

```typescript
import { v4 as uuidv4 } from 'uuid'

const idempotencyKey = uuidv4()

await api.receipts.uploadReceipt(
  householdId,
  file,
  idempotencyKey
)
```

### File Uploads

```typescript
// Upload receipt with progress tracking
const file = event.target.files[0]

try {
  const response = await api.receipts.uploadReceipt(householdId, file)
  console.log('Receipt uploaded:', response.receipt_id)
} catch (error) {
  console.error('Upload failed:', getErrorMessage(error))
}
```

### Query Parameters

```typescript
// Get inventory with filters
const inventory = await api.items.getInventory(householdId, {
  location: 'fridge',
  state: 'low',
  sort_by: 'name',
  limit: 50,
  offset: 0
})

// Get events with filters
const events = await api.events.getEvents(householdId, {
  event_type: 'inventory.used',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  limit: 100
})
```

## API Endpoints

### Households

```typescript
// Create household
api.households.createHousehold(data: HouseholdCreate): Promise<Household>

// Get all households
api.households.getHouseholds(): Promise<HouseholdList>

// Get household by ID
api.households.getHousehold(householdId: string): Promise<HouseholdDetail>

// Update household
api.households.updateHousehold(householdId: string, data: HouseholdUpdate): Promise<Household>

// Delete household
api.households.deleteHousehold(householdId: string): Promise<SuccessResponse>

// Invite member
api.households.inviteMember(householdId: string, data: MemberInvite): Promise<InviteResponse>

// Update member role
api.households.updateMemberRole(householdId: string, memberId: string, data: MemberRoleUpdate): Promise<SuccessResponse>

// Remove member
api.households.removeMember(householdId: string, memberId: string): Promise<SuccessResponse>
```

### Items

```typescript
// Create item
api.items.createItem(householdId: string, data: ItemCreate): Promise<Item>

// Get all items
api.items.getItems(householdId: string): Promise<ItemList>

// Get item by ID
api.items.getItem(itemId: string): Promise<Item>

// Update item
api.items.updateItem(itemId: string, data: ItemUpdate): Promise<Item>

// Delete item
api.items.deleteItem(itemId: string): Promise<SuccessResponse>

// Search items
api.items.searchItems(householdId: string, data: ItemSearch): Promise<ItemSearchResult>

// Get inventory
api.items.getInventory(householdId: string, filter?: InventoryFilter): Promise<InventoryList>

// Update inventory state
api.items.updateInventoryState(itemId: string, data: InventoryStateUpdate): Promise<Inventory>

// Quick actions
api.items.markItemUsed(itemId: string): Promise<QuickActionResponse>
api.items.markItemRestocked(itemId: string): Promise<QuickActionResponse>
api.items.markItemRanOut(itemId: string): Promise<QuickActionResponse>
```

### Receipts

```typescript
// Upload receipt
api.receipts.uploadReceipt(householdId: string, file: File, idempotencyKey?: string): Promise<ReceiptUploadResponse>

// Get all receipts
api.receipts.getReceipts(householdId: string, filter?: ReceiptFilter): Promise<ReceiptList>

// Get receipt by ID
api.receipts.getReceipt(receiptId: string): Promise<ReceiptWithItems>

// Delete receipt
api.receipts.deleteReceipt(receiptId: string): Promise<SuccessResponse>

// Confirm receipt
api.receipts.confirmReceipt(receiptId: string, data: ReceiptConfirmation, idempotencyKey?: string): Promise<ReceiptConfirmationResponse>

// Get receipt status
api.receipts.getReceiptStatus(receiptId: string): Promise<Receipt>
```

### Events

```typescript
// Get events
api.events.getEvents(householdId: string, filter?: EventFilter): Promise<EventList>

// Get item event history
api.events.getItemEventHistory(itemId: string, filter?: EventFilter): Promise<EventHistoryList>

// Export event history
api.events.exportEventHistory(householdId: string, filter?: EventFilter): Promise<Blob>
```

### Restock

```typescript
// Get restock list
api.restock.getRestockList(householdId: string, filter?: RestockFilter): Promise<RestockList>

// Dismiss restock item
api.restock.dismissRestockItem(itemId: string, data: RestockDismiss): Promise<SuccessResponse>

// Export restock list
api.restock.exportRestockList(householdId: string, format?: 'text' | 'json'): Promise<RestockExportResponse>

// Nimbly Integration (Phase 3)
api.restock.generateRestockIntent(householdId: string): Promise<RestockIntent>
api.restock.getRestockIntent(intentId: string): Promise<RestockIntent>
api.restock.handoffToNimbly(intentId: string, approved: boolean): Promise<SuccessResponse>
api.restock.receiveActionOptions(intentId: string): Promise<ActionOptionsResponse>
```

## React Hooks (Coming Soon)

For easier integration with React components, consider creating custom hooks:

```typescript
// Example: useInventory hook
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useInventory(householdId: string, filter?: InventoryFilter) {
  return useQuery({
    queryKey: ['inventory', householdId, filter],
    queryFn: () => api.items.getInventory(householdId, filter),
  })
}

// Usage in component
const { data, isLoading, error } = useInventory(householdId, { location: 'fridge' })
```

## Configuration

The API client uses environment variables for configuration:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing

When testing components that use the API client, you can mock the API:

```typescript
import { vi } from 'vitest'
import * as api from '@/lib/api'

// Mock API functions
vi.mock('@/lib/api', () => ({
  api: {
    items: {
      getItems: vi.fn().mockResolvedValue({ items: [], total: 0 }),
      markItemUsed: vi.fn().mockResolvedValue({ message: 'Success' }),
    },
  },
}))
```

## Architecture

```
web/lib/api/
├── client.ts           # Core API client with fetch wrapper
├── types.ts            # TypeScript types for all API models
├── index.ts            # Main entry point
├── endpoints/
│   ├── households.ts   # Household endpoints
│   ├── items.ts        # Item and inventory endpoints
│   ├── receipts.ts     # Receipt endpoints
│   ├── events.ts       # Event log endpoints
│   └── restock.ts      # Restock list endpoints
└── README.md           # This file
```

## Best Practices

1. **Always handle errors**: Use try-catch blocks and check for specific error types
2. **Use TypeScript types**: Import types from `@/lib/api` for type safety
3. **Implement loading states**: Show loading indicators during API calls
4. **Cache responses**: Use React Query or SWR for caching and revalidation
5. **Handle authentication**: Check for `AuthenticationError` and redirect to login
6. **Use idempotency keys**: For critical operations like receipt uploads
7. **Implement retry logic**: For transient errors (network issues, rate limits)
8. **Show user-friendly errors**: Convert API errors to user-friendly messages

## Troubleshooting

### "Authentication required" error

Make sure the user is logged in and has a valid Supabase session:

```typescript
import { isAuthenticated } from '@/lib/api'

if (!await isAuthenticated()) {
  router.push('/auth/login')
}
```

### "Network error: Unable to connect to server"

Check that:
1. The API server is running (`http://localhost:8000`)
2. The `NEXT_PUBLIC_API_URL` environment variable is set correctly
3. CORS is configured properly on the backend

### Rate limit errors

Implement exponential backoff:

```typescript
import { RateLimitError } from '@/lib/api'

async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error instanceof RateLimitError && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
        continue
      }
      throw error
    }
  }
}
```

## Contributing

When adding new endpoints:

1. Add types to `types.ts`
2. Create endpoint functions in the appropriate file under `endpoints/`
3. Export from `index.ts`
4. Update this README with usage examples
5. Add tests for the new endpoints
