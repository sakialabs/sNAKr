# Integration Tests

End-to-end and integration tests for the sNAKr application.

## Overview

This directory contains integration tests that verify the entire application stack works together correctly. Unlike unit tests (which live alongside the code they test), integration tests verify cross-component behavior.

---

## Directory Structure

```
tests/
├── README.md                    # This file
├── .gitkeep                     # Keeps folder in git
│
├── api/                         # API integration tests (future)
│   ├── test_auth.py            # Authentication flow tests
│   ├── test_households.py      # Household management tests
│   ├── test_inventory.py       # Inventory operations tests
│   └── test_receipts.py        # Receipt upload and processing tests
│
├── e2e/                         # End-to-end tests (future)
│   ├── test_receipt_flow.py   # Complete receipt processing flow
│   ├── test_restock_flow.py   # Restock list generation flow
│   └── test_multi_user.py     # Multi-user household scenarios
│
└── fixtures/                    # Test data and fixtures (future)
    ├── sample_receipts/        # Sample receipt images/PDFs
    ├── test_data.json          # Test data sets
    └── factories.py            # Test data factories
```

---

## Test Types

### API Integration Tests
Tests that verify API endpoints work correctly with the database and external services.

**Location**: `api/`

**What they test**:
- HTTP request/response handling
- Authentication and authorization
- Database operations through API
- Error handling and validation
- Multi-tenant isolation

**Example**:
```python
def test_create_household(client, auth_token):
    """Test creating a new household via API"""
    response = client.post(
        "/api/v1/households",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Test Household"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Household"
```

---

### End-to-End Tests
Tests that verify complete user workflows from start to finish.

**Location**: `e2e/`

**What they test**:
- Complete user journeys
- Multiple components working together
- Real-world scenarios
- Data flow through entire system

**Example**:
```python
def test_receipt_to_inventory_flow(client, household):
    """Test complete flow: upload receipt → OCR → parse → confirm → update inventory"""
    # 1. Upload receipt
    receipt = upload_receipt(client, household, "sample_receipt.jpg")
    
    # 2. Wait for OCR processing
    wait_for_status(client, receipt["id"], "parsed")
    
    # 3. Confirm items
    confirm_receipt_items(client, receipt["id"])
    
    # 4. Verify inventory updated
    inventory = get_inventory(client, household["id"])
    assert len(inventory) > 0
```

---

## Database Tests

**Note**: Database-specific tests (migrations, RLS policies, triggers) are located in:
- `supabase/migrations/tests/` - Database integration tests
- `supabase/migrations/verify/` - Migration verification scripts

See [supabase/migrations/README.md](../supabase/migrations/README.md) for database testing documentation.

---

## Running Tests

### Prerequisites

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Start services
./scripts/dev/start.sh              # macOS/Linux
.\scripts\dev\start.ps1             # Windows
```

### Run All Tests

```bash
# From project root
pytest tests/

# With coverage
pytest tests/ --cov=api --cov-report=html

# Verbose output
pytest tests/ -v
```

### Run Specific Test Suites

```bash
# API tests only
pytest tests/api/

# E2E tests only
pytest tests/e2e/

# Specific test file
pytest tests/api/test_households.py

# Specific test function
pytest tests/api/test_households.py::test_create_household
```

### Run with Different Environments

```bash
# Development
pytest tests/ --env=dev

# Staging
pytest tests/ --env=staging

# CI/CD
pytest tests/ --env=ci
```

---

## Writing Tests

### Test Structure

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_example(client: AsyncClient, auth_token: str):
    """
    Test description explaining what this test verifies.
    
    Given: Initial state or preconditions
    When: Action being tested
    Then: Expected outcome
    """
    # Arrange
    household = await create_test_household(client, auth_token)
    
    # Act
    response = await client.get(
        f"/api/v1/households/{household['id']}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == household["id"]
```

### Test Naming Conventions

- Test files: `test_<feature>.py`
- Test functions: `test_<action>_<expected_result>`
- Test classes: `Test<Feature>`

**Examples**:
- `test_create_household_success`
- `test_create_household_unauthorized`
- `test_get_inventory_empty_household`

### Fixtures

Use pytest fixtures for common setup:

```python
@pytest.fixture
async def household(client, auth_token):
    """Create a test household"""
    response = await client.post(
        "/api/v1/households",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Test Household"}
    )
    return response.json()

@pytest.fixture
async def auth_token(client):
    """Get authentication token for test user"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpass"}
    )
    return response.json()["access_token"]
```

---

## Test Data Management

### Test Database

Integration tests use a separate test database to avoid affecting development data.

**Configuration**:
```bash
# .env.test
DATABASE_URL=postgresql://snakr_user:snakr_pass@localhost:5433/snakr_test
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=<test-anon-key>
```

### Cleanup

Tests should clean up after themselves:

```python
@pytest.fixture
async def household(client, auth_token):
    """Create and cleanup test household"""
    # Setup
    response = await client.post(
        "/api/v1/households",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Test Household"}
    )
    household = response.json()
    
    yield household
    
    # Teardown
    await client.delete(
        f"/api/v1/households/{household['id']}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
```

### Test Data Factories

Use factories for creating test data:

```python
# tests/fixtures/factories.py
from faker import Faker

fake = Faker()

def household_factory(**kwargs):
    """Generate test household data"""
    return {
        "name": kwargs.get("name", fake.company()),
        **kwargs
    }

def item_factory(**kwargs):
    """Generate test item data"""
    return {
        "name": kwargs.get("name", fake.word()),
        "category": kwargs.get("category", "pantry_staple"),
        "location": kwargs.get("location", "pantry"),
        **kwargs
    }
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Push to main branch
- Nightly builds

**Workflow**: `.github/workflows/test.yml`

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r api/requirements.txt
      - name: Run tests
        run: pytest tests/ --cov --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Coverage

### Coverage Goals

- **API Endpoints**: 80%+ coverage
- **Business Logic**: 90%+ coverage
- **Critical Paths**: 100% coverage (auth, payments, data isolation)

### Viewing Coverage

```bash
# Generate HTML coverage report
pytest tests/ --cov=api --cov-report=html

# Open in browser
open htmlcov/index.html  # macOS
start htmlcov/index.html # Windows
```

### Coverage Reports

Coverage reports are automatically generated in CI/CD and uploaded to Codecov.

---

## Best Practices

### DO ✅

- **Test behavior, not implementation** - Focus on what the system does, not how
- **Use descriptive test names** - Test name should explain what's being tested
- **Keep tests independent** - Each test should run in isolation
- **Use fixtures for setup** - Avoid duplicating setup code
- **Clean up after tests** - Don't leave test data in the database
- **Test edge cases** - Empty lists, null values, boundary conditions
- **Test error handling** - Verify errors are handled gracefully

### DON'T ❌

- **Don't test external services directly** - Use mocks or test doubles
- **Don't share state between tests** - Each test should be independent
- **Don't use production data** - Always use test data
- **Don't skip cleanup** - Always clean up test data
- **Don't test framework code** - Trust that FastAPI, SQLAlchemy, etc. work
- **Don't make tests too complex** - If a test is hard to understand, simplify it

---

## Troubleshooting

### Tests Failing Locally

1. **Check services are running**:
   ```bash
   ./scripts/utils/health.sh
   ```

2. **Reset test database**:
   ```bash
   supabase db reset
   ```

3. **Clear test cache**:
   ```bash
   pytest --cache-clear
   ```

### Slow Tests

1. **Run specific tests**:
   ```bash
   pytest tests/api/test_households.py -v
   ```

2. **Use parallel execution**:
   ```bash
   pytest tests/ -n auto
   ```

3. **Profile slow tests**:
   ```bash
   pytest tests/ --durations=10
   ```

### Database Connection Issues

1. **Verify connection string**:
   ```bash
   echo $DATABASE_URL
   ```

2. **Check Supabase is running**:
   ```bash
   supabase status
   ```

3. **Restart services**:
   ```bash
   ./scripts/dev/reset.sh
   ```

---

## Future Enhancements

### Planned Test Additions

- [ ] API integration tests for all endpoints
- [ ] E2E tests for critical user flows
- [ ] Performance tests for high-load scenarios
- [ ] Security tests for authentication and authorization
- [ ] Mobile app integration tests
- [ ] Web app E2E tests with Playwright

### Test Infrastructure

- [ ] Test data seeding scripts
- [ ] Automated test data generation
- [ ] Visual regression testing
- [ ] Load testing with Locust
- [ ] Contract testing with Pact

---

## See Also

- [API Testing Guide](../docs/TESTING.md) - Comprehensive testing strategy
- [Database Tests](../supabase/migrations/README.md) - Database-specific tests
- [CI/CD Pipeline](../docs/ci-cd.md) - Automated testing in CI/CD
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute tests
