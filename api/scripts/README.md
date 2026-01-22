# API Utility Scripts

This folder contains utility scripts for verifying and validating the API setup.

## Scripts

### verify_openapi.py

Verifies that OpenAPI documentation is properly configured.

**Usage:**
```bash
cd api
conda activate snakr  # or activate your venv
python scripts/verify_openapi.py
```

**What it does:**
- Creates the FastAPI app
- Generates the OpenAPI schema
- Lists all endpoints and tags
- Counts data models
- Saves schema to `openapi_schema.json`
- Verifies everything is properly configured

**Output:**
- Console output with verification results
- `openapi_schema.json` file for inspection

### verify_structure.py

Verifies that all required directories and files exist.

**Usage:**
```bash
cd api
conda activate snakr  # or activate your venv
python scripts/verify_structure.py
```

**What it does:**
- Checks all required directories exist
- Checks all required files exist
- Verifies key features are configured:
  - CORS configuration
  - Error handling
  - Health check endpoint
  - Logging setup
  - Supabase client

**Exit codes:**
- `0` - All checks passed
- `1` - Some checks failed

### validate_rate_limit.py

Validates that rate limiting middleware is properly configured.

**Usage:**
```bash
cd api
conda activate snakr  # or activate your venv
python scripts/validate_rate_limit.py
```

**What it does:**
- Checks rate limiting files exist
- Verifies imports work correctly
- Checks configuration values
- Verifies slowapi dependency is installed
- Checks integration in main app

**Exit codes:**
- `0` - All validation checks passed
- `1` - Some validation checks failed

## When to Use

### During Development

Run these scripts when:
- Setting up the project for the first time
- After making structural changes
- Before committing major changes
- When troubleshooting configuration issues

### In CI/CD

These scripts can be integrated into CI/CD pipelines to:
- Verify project structure before tests
- Validate configuration before deployment
- Generate OpenAPI schema for documentation

## Adding New Scripts

When adding new utility scripts:

1. **Name clearly:** Use descriptive names (e.g., `verify_X.py`, `validate_Y.py`)
2. **Add docstring:** Include module-level docstring explaining purpose
3. **Add to README:** Document the script in this file
4. **Use exit codes:** Return 0 for success, 1 for failure
5. **Print clearly:** Use clear output with ✓ and ✗ symbols
6. **Handle errors:** Catch and report errors gracefully

## Example Script Template

```python
"""
Brief description of what this script does
"""
import sys
from pathlib import Path

def main():
    """Main function"""
    print("=" * 60)
    print("Script Name")
    print("=" * 60)
    
    all_checks_passed = True
    
    # Your checks here
    
    print("\n" + "=" * 60)
    if all_checks_passed:
        print("✓ All checks passed!")
        return 0
    else:
        print("✗ Some checks failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
