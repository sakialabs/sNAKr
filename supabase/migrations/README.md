# Supabase Migrations

This directory contains database migrations for the sNAKr MVP project.

## Directory Structure

```
supabase/migrations/
├── README.md                                    # This file
│
├── 20260121063923_create_households_table.sql   # Migration files (timestamped)
├── 20260121064352_create_household_members_table.sql
├── 20260121133416_create_items_table.sql
├── 20260121135205_create_inventory_table.sql
├── 20260121142310_create_events_table.sql
├── 20260121150000_create_receipts_table.sql
├── 20260121160000_create_receipt_items_table.sql
├── 20260121170000_create_predictions_table.sql
├── 20260121180000_create_restock_list_table.sql
├── 20260121190000_create_receipts_storage_bucket.sql
│
├── verify/                                      # Verification scripts
│   ├── households.sql
│   ├── household_members.sql
│   ├── items.sql
│   ├── inventory.sql
│   ├── events.sql
│   ├── receipts.sql
│   ├── receipt_items.sql
│   ├── predictions.sql
│   ├── restock_list.sql
│   └── receipts_storage_bucket.sql
│
└── tests/                                       # Test scripts
    ├── rls_multi_household.sql                 # Multi-tenant isolation tests
    ├── receipts_storage_rls.sql                # Storage bucket RLS tests
    ├── events_integration.sql                  # Events integration tests
    ├── inventory_complete.sql                  # Complete inventory tests
    ├── inventory_table.sql                     # Inventory table tests
    └── trigger.sql                             # Trigger tests
```

---

## Migration Files

Migrations are timestamped SQL files that create and modify database schema. They are applied in chronological order.

### Completed Migrations (10 total)

1. **households** - Shared household identity
2. **household_members** - Multi-tenant boundary with roles
3. **items** - Canonical item catalog with fuzzy search
4. **inventory** - Current state per item with fuzzy states
5. **events** - Immutable event log
6. **receipts** - Receipt files and OCR processing
7. **receipt_items** - Parsed line items with ML candidates
8. **predictions** - ML predictions for restocking
9. **restock_list** - Restock recommendations
10. **receipts_storage_bucket** - Secure file storage with RLS

---

## Verification Scripts

Each migration has a corresponding verification script in the `verify/` folder to test the migration was applied correctly.

**Available verification scripts:**
- `verify/households.sql` - Tests households table
- `verify/household_members.sql` - Tests household_members table
- `verify/items.sql` - Tests items table (includes trigram search test)
- `verify/inventory.sql` - Tests inventory table (11 comprehensive tests)
- `verify/events.sql` - Tests events table
- `verify/receipts.sql` - Tests receipts table
- `verify/receipt_items.sql` - Tests receipt_items table (9 tests including JSONB)
- `verify/predictions.sql` - Tests predictions table
- `verify/restock_list.sql` - Tests restock_list table
- `verify/receipts_storage_bucket.sql` - Tests storage bucket configuration

**Run verification:**
```bash
# Using Supabase CLI
psql $DATABASE_URL -f supabase/migrations/verify/households.sql

# Using Supabase CLI (recommended)
supabase db reset
supabase test db

# Or connect directly to PostgreSQL
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/verify/households.sql
```

---

## Test Scripts

The `tests/` folder contains integration and comprehensive test suites.

**Available test scripts:**
- `tests/rls_multi_household.sql` - Multi-tenant isolation (18 tests, 100% pass rate)
- `tests/receipts_storage_rls.sql` - Storage bucket RLS policies
- `tests/events_integration.sql` - Events integration tests
- `tests/inventory_complete.sql` - Complete inventory workflow tests
- `tests/inventory_table.sql` - Inventory table tests
- `tests/trigger.sql` - Trigger tests

**Run tests:**
```bash
# Using Supabase CLI
supabase db reset  # Runs all migrations and tests

# Or run specific test
psql $DATABASE_URL -f supabase/migrations/tests/rls_multi_household.sql

# Using Supabase CLI (recommended)
supabase test db

# Or connect directly to PostgreSQL
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/tests/rls_multi_household.sql
```

---

## Running Migrations

### With Supabase CLI (Recommended)

```bash
# Start Supabase locally
supabase start

# Apply all migrations
supabase db reset

# Create a new migration
supabase migration new <migration_name>

# Check migration status
supabase migration list
```

### With Docker PostgreSQL (Development)

```bash
# Apply migrations
supabase db reset

# Run verification script
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/verify/<table>.sql

# Run test script
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/tests/<test_name>.sql
```

---

## RLS Multi-Household Isolation Testing

### Overview
All RLS policies have been thoroughly tested and verified to work correctly with multiple households. The system successfully isolates data between households while supporting users belonging to multiple households.

### Test Suite
**Test File**: `tests/rls_multi_household.sql`

**Test Coverage**: 18 comprehensive tests covering:
- Household isolation (2 tests)
- Item catalog isolation (2 tests)
- Inventory state isolation (1 test)
- Event log isolation (2 tests)
- Receipt file isolation (1 test)
- Receipt items isolation (2 tests)
- Predictions isolation (2 tests)
- Restock list isolation (2 tests)
- Direct ID access prevention (2 tests)
- Household members visibility (2 tests)

### Test Scenarios

**Scenario 1: Single Household User (User 1)**
- Household: Household 1 (Admin)
- Expected: Can only access Household 1 data
- Result: ✅ All tests passed

**Scenario 2: Multi-Household User (User 2)**
- Households: Household 1 (Member), Household 2 (Admin)
- Expected: Can access data from both households
- Result: ✅ All tests passed

**Scenario 3: Isolated User (User 3)**
- Household: Household 3 (Admin)
- Expected: Cannot access Household 1 or 2 data
- Result: ✅ All tests passed

### Security Guarantees

✅ **Multi-Tenant Isolation**
- Users cannot access data from households they don't belong to
- Direct ID access attempts are blocked by RLS policies
- Foreign key relationships maintain isolation boundaries

✅ **Multi-Household Support**
- Users can belong to multiple households
- Data access is properly scoped across all memberships
- No data leakage between households

✅ **Role-Based Access**
- Admin and member roles are properly enforced
- Household membership determines data visibility
- RLS policies use `auth.uid()` for user context

### Test Results Summary
- **Total Tests**: 18
- **Passed**: 18
- **Failed**: 0
- **Success Rate**: 100%
- **Status**: ✅ PRODUCTION READY

### Running RLS Tests

```bash
# Using Supabase CLI
supabase db reset

# Or run specific test
psql $DATABASE_URL -f supabase/migrations/tests/rls_multi_household.sql

# Using Supabase CLI (recommended)
supabase test db

# Or connect directly to PostgreSQL
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/migrations/tests/rls_multi_household.sql
```

---

## Supabase Storage: Receipts Bucket

### Overview
A secure Supabase Storage bucket has been configured for receipt files with encryption and Row Level Security (RLS) policies that restrict access to household members only.

### Bucket Configuration
- **Bucket ID**: `receipts`
- **Access Level**: Private (not publicly accessible)
- **File Size Limit**: 10MB (10,485,760 bytes)
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/png`
  - `application/pdf`

### Security Features

**Encryption**
- ✅ Encryption at rest: Enabled by default in Supabase Storage
- ✅ Encryption in transit: TLS 1.3 for all API requests

**RLS Policies on storage.objects**
1. `receipts_storage_select_policy` - Users can view receipt files from their households
2. `receipts_storage_insert_policy` - Users can upload receipt files to their households
3. `receipts_storage_update_policy` - Users can update receipt files in their households
4. `receipts_storage_delete_policy` - Users can delete receipt files from their households

### File Path Structure
Files are organized by household to enforce isolation:
```
receipts/
  ├── {household_id_1}/
  │   ├── {receipt_id_1}.jpg
  │   ├── {receipt_id_2}.png
  │   └── {receipt_id_3}.pdf
  └── {household_id_2}/
      ├── {receipt_id_4}.jpg
      └── {receipt_id_5}.pdf
```

### Integration with Database
The storage bucket integrates with the `receipts` table:
- `file_path` column stores: `{household_id}/{receipt_id}.{ext}`
- RLS policies on both storage and database ensure consistent security
- File operations are atomic with database records

### Testing Storage RLS

**Test File**: `tests/receipts_storage_rls.sql`

Run tests:
```bash
# Using Supabase CLI
supabase db reset

# Or run specific test
psql $DATABASE_URL -f supabase/migrations/tests/receipts_storage_rls.sql
```

### Verification
**Verification File**: `verify/receipts_storage_bucket.sql`

Checks:
- ✅ Bucket exists and is configured correctly
- ✅ All RLS policies are in place
- ✅ Security settings (privacy, size limit, MIME types)
- ✅ Encryption enabled

---

## Completed Migrations Summary

### Phase 0.2: Database Setup ✅ COMPLETE

All database tables, indexes, RLS policies, and storage buckets have been successfully created and tested.

**Tables Created** (9 total):
1. ✅ `households` - Shared household identity
2. ✅ `household_members` - Multi-tenant boundary with roles
3. ✅ `items` - Canonical item catalog with fuzzy search
4. ✅ `inventory` - Current state per item with fuzzy states
5. ✅ `events` - Immutable event log
6. ✅ `receipts` - Receipt files and OCR processing
7. ✅ `receipt_items` - Parsed line items with ML candidates
8. ✅ `predictions` - ML predictions for restocking
9. ✅ `restock_list` - Restock recommendations

**Storage Buckets** (1 total):
1. ✅ `receipts` - Secure file storage with RLS

**Security**:
- ✅ RLS policies on all tables (100% coverage)
- ✅ RLS policies on storage bucket
- ✅ Multi-tenant isolation verified (18/18 tests passed)
- ✅ Encryption at rest and in transit

**Performance**:
- ✅ Comprehensive indexes on all tables
- ✅ Trigram indexes for fuzzy search
- ✅ GIN indexes for JSONB queries
- ✅ Composite indexes for common query patterns

**Data Integrity**:
- ✅ Foreign key constraints with appropriate CASCADE/SET NULL
- ✅ Check constraints for valid values
- ✅ Unique constraints where needed
- ✅ Automatic `updated_at` triggers

### Next Phase: API Development (Phase 0.3)
With the database complete, the next phase focuses on building the FastAPI backend to expose these tables through secure REST endpoints.

---

## References

- [PostgreSQL pg_trgm Documentation](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
