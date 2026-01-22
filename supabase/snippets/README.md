# Supabase SQL Snippets

Useful SQL snippets for common queries and operations in sNAKr.

## Quick Reference

These snippets can be run in Supabase Studio's SQL Editor or via `psql`.

---

## Household Queries

### Get all households for a user
```sql
SELECT h.*
FROM households h
JOIN household_members hm ON h.id = hm.household_id
WHERE hm.user_id = auth.uid();
```

### Get household members with roles
```sql
SELECT 
    hm.user_id,
    hm.role,
    hm.joined_at,
    au.email
FROM household_members hm
LEFT JOIN auth.users au ON hm.user_id = au.id
WHERE hm.household_id = 'your-household-id'
ORDER BY hm.joined_at;
```

### Create a new household with admin
```sql
-- Insert household
INSERT INTO households (name)
VALUES ('My Household')
RETURNING id;

-- Add user as admin (use the returned id)
INSERT INTO household_members (household_id, user_id, role)
VALUES ('household-id-from-above', auth.uid(), 'admin');
```

---

## Inventory Queries

### Get current inventory state for a household
```sql
SELECT 
    i.id,
    it.name,
    it.category,
    it.location,
    inv.state,
    inv.confidence,
    inv.last_event_at,
    inv.updated_at
FROM items i
JOIN inventory inv ON i.id = inv.item_id
WHERE i.household_id = 'your-household-id'
ORDER BY 
    CASE inv.state
        WHEN 'out' THEN 1
        WHEN 'almost_out' THEN 2
        WHEN 'low' THEN 3
        WHEN 'ok' THEN 4
        WHEN 'plenty' THEN 5
    END,
    it.name;
```

### Get items running low
```sql
SELECT 
    it.name,
    it.category,
    inv.state,
    inv.last_event_at
FROM items it
JOIN inventory inv ON it.id = inv.item_id
WHERE it.household_id = 'your-household-id'
  AND inv.state IN ('low', 'almost_out', 'out')
ORDER BY 
    CASE inv.state
        WHEN 'out' THEN 1
        WHEN 'almost_out' THEN 2
        WHEN 'low' THEN 3
    END;
```

### Update inventory state
```sql
UPDATE inventory
SET 
    state = 'low',
    confidence = 0.85,
    last_event_at = NOW(),
    updated_at = NOW()
WHERE item_id = 'your-item-id';
```

---

## Item Queries

### Search items by name (fuzzy search)
```sql
SELECT 
    id,
    name,
    category,
    location,
    similarity(name, 'milk') as score
FROM items
WHERE household_id = 'your-household-id'
  AND similarity(name, 'milk') > 0.3
ORDER BY score DESC
LIMIT 5;
```

### Get items by category
```sql
SELECT *
FROM items
WHERE household_id = 'your-household-id'
  AND category = 'dairy'
ORDER BY name;
```

### Add a new item
```sql
INSERT INTO items (household_id, name, category, location)
VALUES (
    'your-household-id',
    'Whole Milk 2%',
    'dairy',
    'fridge'
)
RETURNING *;
```

---

## Receipt Queries

### Get recent receipts with status
```sql
SELECT 
    id,
    file_path,
    status,
    store_name,
    receipt_date,
    total_amount,
    item_count,
    confirmed_count,
    uploaded_at
FROM receipts
WHERE household_id = 'your-household-id'
ORDER BY uploaded_at DESC
LIMIT 10;
```

### Get receipts pending confirmation
```sql
SELECT 
    r.id,
    r.store_name,
    r.receipt_date,
    r.item_count,
    r.confirmed_count,
    r.parsed_at
FROM receipts r
WHERE r.household_id = 'your-household-id'
  AND r.status = 'parsed'
  AND r.confirmed_count < r.item_count
ORDER BY r.parsed_at DESC;
```

### Get receipt items with mapping candidates
```sql
SELECT 
    ri.id,
    ri.raw_name,
    ri.normalized_name,
    ri.quantity,
    ri.unit,
    ri.price,
    ri.status,
    ri.mapping_candidates,
    i.name as mapped_item_name
FROM receipt_items ri
LEFT JOIN items i ON ri.item_id = i.id
WHERE ri.receipt_id = 'your-receipt-id'
ORDER BY ri.line_number;
```

---

## Event Queries

### Get recent inventory events
```sql
SELECT 
    e.id,
    e.event_type,
    e.event_data,
    e.confidence,
    e.created_at,
    it.name as item_name
FROM events e
LEFT JOIN items it ON e.item_id = it.id
WHERE e.household_id = 'your-household-id'
  AND e.event_type LIKE 'inventory.%'
ORDER BY e.created_at DESC
LIMIT 20;
```

### Log an inventory event
```sql
INSERT INTO events (
    household_id,
    item_id,
    event_type,
    event_data,
    confidence
)
VALUES (
    'your-household-id',
    'your-item-id',
    'inventory.used',
    '{"quantity": 1, "unit": "gallon", "source": "manual"}'::jsonb,
    1.0
);
```

---

## Restock List Queries

### Get current restock recommendations
```sql
SELECT 
    rl.id,
    it.name,
    it.category,
    rl.priority,
    rl.reason,
    rl.confidence,
    rl.created_at
FROM restock_list rl
JOIN items it ON rl.item_id = it.id
WHERE rl.household_id = 'your-household-id'
ORDER BY 
    CASE rl.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    rl.created_at DESC;
```

### Add item to restock list
```sql
INSERT INTO restock_list (
    household_id,
    item_id,
    priority,
    reason,
    confidence
)
VALUES (
    'your-household-id',
    'your-item-id',
    'high',
    'Running low based on usage pattern',
    0.85
);
```

---

## Analytics Queries

### Inventory state distribution
```sql
SELECT 
    inv.state,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM inventory inv
JOIN items it ON inv.item_id = it.id
WHERE it.household_id = 'your-household-id'
GROUP BY inv.state
ORDER BY count DESC;
```

### Most frequently used items (last 30 days)
```sql
SELECT 
    it.name,
    it.category,
    COUNT(*) as usage_count
FROM events e
JOIN items it ON e.item_id = it.id
WHERE e.household_id = 'your-household-id'
  AND e.event_type = 'inventory.used'
  AND e.created_at >= NOW() - INTERVAL '30 days'
GROUP BY it.id, it.name, it.category
ORDER BY usage_count DESC
LIMIT 10;
```

### Receipt processing stats
```sql
SELECT 
    status,
    COUNT(*) as count,
    AVG(item_count) as avg_items,
    AVG(EXTRACT(EPOCH FROM (parsed_at - processing_started_at))) as avg_processing_seconds
FROM receipts
WHERE household_id = 'your-household-id'
  AND uploaded_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

---

## Maintenance Queries

### Clean up old events (keep last 90 days)
```sql
DELETE FROM events
WHERE household_id = 'your-household-id'
  AND created_at < NOW() - INTERVAL '90 days';
```

### Find orphaned inventory records (items without inventory)
```sql
SELECT it.*
FROM items it
LEFT JOIN inventory inv ON it.id = inv.item_id
WHERE it.household_id = 'your-household-id'
  AND inv.id IS NULL;
```

### Reset test data
```sql
-- WARNING: This deletes all data for a household
DELETE FROM household_members WHERE household_id = 'test-household-id';
DELETE FROM households WHERE id = 'test-household-id';
-- CASCADE will handle related records
```

---

## Performance Queries

### Check index usage
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Find slow queries (requires pg_stat_statements extension)
```sql
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query LIKE '%households%'
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Tips

1. **Replace UUIDs**: All `'your-household-id'` placeholders should be replaced with actual UUIDs
2. **Use auth.uid()**: In Supabase, `auth.uid()` returns the current user's ID
3. **Test in Studio**: Run these in Supabase Studio's SQL Editor for quick testing
4. **RLS Applies**: All queries respect Row Level Security policies
5. **Transactions**: Wrap multiple operations in `BEGIN; ... COMMIT;` for atomicity

---

## See Also

- [Migrations README](../migrations/README.md) - Database schema documentation
- [Supabase Docs](https://supabase.com/docs) - Official Supabase documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - PostgreSQL reference
