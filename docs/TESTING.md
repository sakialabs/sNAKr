# Testing Guide

Comprehensive testing strategy for sNAKr.

---

## Testing Philosophy

1. **Test behavior, not implementation**
2. **Write tests alongside features**
3. **Aim for 80%+ coverage**
4. **Test the happy path and edge cases**
5. **Keep tests fast and focused**

---

## Test Types

### Unit Tests

Test individual functions and components in isolation.

**Backend (Python)**:
```bash
# Run all unit tests
pytest tests/unit/

# Run with coverage
pytest --cov=api tests/unit/

# Run specific test file
pytest tests/unit/test_prediction_service.py
```

**Frontend (TypeScript)**:
```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- InventoryList.test.tsx
```

**What to test**:
- Service layer logic
- Utility functions
- State transitions
- Prediction algorithms
- Parsing and normalization logic

**Example (Python)**:
```python
def test_state_transition_used():
    """Test that Used action transitions state correctly."""
    assert transition_state(State.PLENTY, Action.USED) == State.OK
    assert transition_state(State.OK, Action.USED) == State.LOW
    assert transition_state(State.LOW, Action.USED) == State.ALMOST_OUT
    assert transition_state(State.ALMOST_OUT, Action.USED) == State.OUT
```

---

### Integration Tests

Test API endpoints and database interactions end-to-end.

**Backend**:
```bash
# Run integration tests
pytest tests/integration/

# Run with test database
pytest tests/integration/ --db=test
```

**What to test**:
- API endpoints (request → response)
- Database queries with RLS
- Event creation and retrieval
- Receipt pipeline stages
- Multi-tenant isolation

**Example (Python)**:
```python
def test_create_household(client, auth_token):
    """Test household creation endpoint."""
    response = client.post(
        "/households",
        json={"name": "Test Household"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Household"
```

---

### E2E Tests

Test critical user flows from browser to database.

**Frontend**:
```bash
# Run E2E tests with Playwright
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- receipt-upload.spec.ts
```

**What to test**:
- Household creation flow
- Inventory tracking flow
- Receipt upload and confirmation flow
- Restock list flow
- Cross-browser compatibility

**Example (Playwright)**:
```typescript
test('upload and confirm receipt', async ({ page }) => {
  await page.goto('/inventory');
  await page.click('text=Upload Receipt');
  await page.setInputFiles('input[type="file"]', 'test-receipt.jpg');
  await page.waitForSelector('text=Review Items');
  await page.click('text=Confirm All');
  await expect(page.locator('text=Inventory updated')).toBeVisible();
});
```

---

## Receipt Parsing Tests

Critical for MVP success. Test with real receipts from multiple stores.

### Test Receipt Collection

Collect receipts from:
- Whole Foods
- Trader Joe's
- Safeway
- Kroger
- Target
- Local grocery stores

### Parsing Accuracy Metrics

**Line item extraction**:
- Precision: % of extracted items that are correct
- Recall: % of actual items that were extracted
- Target: 80%+ precision and recall

**Item mapping**:
- Top-1 accuracy: % of items mapped correctly on first try
- Top-3 accuracy: % of items where correct mapping is in top 3
- Target: 70%+ top-1, 90%+ top-3

**Test script**:
```bash
# Run receipt parsing benchmark
python scripts/benchmark_receipts.py --receipts=test_data/receipts/

# Output:
# Line item extraction: 85% precision, 82% recall
# Item mapping: 73% top-1, 92% top-3
```

---

## Multi-Tenant Isolation Tests

Critical for security. Test that RLS policies work correctly.

**Test scenarios**:
1. User A cannot access User B's household data
2. User A cannot modify User B's inventory
3. User A cannot see User B's receipts
4. API returns 403 for unauthorized household access

**Example**:
```python
def test_rls_isolation(client, user_a_token, user_b_token, household_b_id):
    """Test that User A cannot access User B's household."""
    response = client.get(
        f"/households/{household_b_id}/items",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    assert response.status_code == 403
```

---

## Performance Tests

Ensure API meets response time targets.

**Targets**:
- GET requests: <200ms p95
- POST requests: <500ms p95
- Receipt upload: <2s for file storage
- Inventory view: <300ms p95

**Load testing**:
```bash
# Run load tests with Locust
locust -f tests/load/locustfile.py --host=http://localhost:8000

# Test scenarios:
# - 100 concurrent users
# - 1000 requests per minute
# - Measure p50, p95, p99 latency
```

---

## Test Data

### Fixtures

Use fixtures for consistent test data.

**Backend (pytest)**:
```python
@pytest.fixture
def household(db):
    """Create a test household."""
    return Household.create(name="Test Household")

@pytest.fixture
def item(db, household):
    """Create a test item."""
    return Item.create(
        household_id=household.id,
        name="Milk 2%",
        category="dairy",
        location="fridge"
    )
```

**Frontend (Jest)**:
```typescript
const mockInventory = [
  { id: '1', name: 'Milk 2%', state: 'low', location: 'fridge' },
  { id: '2', name: 'Eggs', state: 'out', location: 'fridge' },
];
```

### Test Database

Use a separate test database that is reset between tests.

**Setup**:
```bash
# Create test database
createdb snakr_test

# Run migrations
alembic upgrade head --database=test

# Reset between tests
pytest --db-reset
```

---

## Continuous Integration

Tests run automatically on every commit.

**GitHub Actions workflow**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run unit tests
        run: pytest tests/unit/
      - name: Run integration tests
        run: pytest tests/integration/
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Test Coverage

Track coverage to ensure critical code is tested.

**Backend**:
```bash
# Generate coverage report
pytest --cov=api --cov-report=html tests/

# View report
open htmlcov/index.html
```

**Frontend**:
```bash
# Generate coverage report
npm test -- --coverage

# View report
open coverage/lcov-report/index.html
```

**Coverage targets**:
- Overall: 80%+
- Critical paths (auth, RLS, receipt pipeline): 90%+
- UI components: 70%+

---

## Manual Testing

Some scenarios require manual testing.

### Receipt Upload Flow
1. Upload receipt from Whole Foods
2. Verify OCR extracts text correctly
3. Verify line items are parsed
4. Verify item mapping suggestions are reasonable
5. Edit one item name
6. Confirm and verify inventory updates

### Multi-Device Testing
- Test on Chrome, Firefox, Safari
- Test on mobile (iOS, Android)
- Test on tablet
- Verify responsive design

### Accessibility Testing
- Test with screen reader
- Test keyboard navigation
- Verify color contrast (4.5:1 minimum)
- Verify focus indicators

---

## Debugging Tests

**Backend**:
```bash
# Run tests with verbose output
pytest -v tests/

# Run tests with print statements
pytest -s tests/

# Run specific test with debugger
pytest --pdb tests/unit/test_prediction_service.py::test_predict_state
```

**Frontend**:
```bash
# Run tests in watch mode
npm test -- --watch

# Debug specific test
npm test -- --testNamePattern="InventoryList renders items"
```

---

## Test Maintenance

- Review and update tests when requirements change
- Remove obsolete tests
- Refactor tests to reduce duplication
- Keep test data realistic
- Document complex test scenarios

---

## Definition of Done

A feature is not complete until:
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing (for critical flows)
- [ ] Coverage meets targets (80%+ overall)
- [ ] Manual testing completed
- [ ] Tests pass in CI
