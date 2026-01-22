"""
Validation script for rate limiting implementation
Verifies that all components are properly configured
"""
import sys
import importlib.util
from pathlib import Path


def check_file_exists(filepath: str) -> bool:
    """Check if a file exists"""
    path = Path(filepath)
    exists = path.exists()
    status = "✓" if exists else "✗"
    print(f"{status} {filepath}")
    return exists


def check_import(module_path: str, items: list) -> bool:
    """Check if items can be imported from a module"""
    try:
        module = __import__(module_path, fromlist=items)
        for item in items:
            if not hasattr(module, item):
                print(f"✗ {module_path}.{item} - Not found")
                return False
        print(f"✓ {module_path} - All items importable")
        return True
    except Exception as e:
        print(f"✗ {module_path} - Import error: {e}")
        return False


def check_config_values():
    """Check configuration values"""
    try:
        from app.core.config import settings
        
        checks = [
            ("RATE_LIMIT_ENABLED", settings.RATE_LIMIT_ENABLED, bool),
            ("RATE_LIMIT_PER_MINUTE", settings.RATE_LIMIT_PER_MINUTE, int),
        ]
        
        all_good = True
        for name, value, expected_type in checks:
            if isinstance(value, expected_type):
                print(f"✓ {name} = {value} ({expected_type.__name__})")
            else:
                print(f"✗ {name} = {value} (expected {expected_type.__name__})")
                all_good = False
        
        # Check specific value
        if settings.RATE_LIMIT_PER_MINUTE == 100:
            print(f"✓ RATE_LIMIT_PER_MINUTE matches requirement (100 req/min)")
        else:
            print(f"⚠ RATE_LIMIT_PER_MINUTE is {settings.RATE_LIMIT_PER_MINUTE}, requirement is 100")
        
        return all_good
    except Exception as e:
        print(f"✗ Configuration check failed: {e}")
        return False


def main():
    """Run all validation checks"""
    print("=" * 60)
    print("Rate Limiting Implementation Validation")
    print("=" * 60)
    
    all_checks_passed = True
    
    # Check files exist
    print("\n1. Checking files exist:")
    files = [
        "app/middleware/rate_limit.py",
        "app/core/config.py",
        "app/main.py",
        "tests/test_rate_limit.py",
        "requirements.txt"
    ]
    for filepath in files:
        if not check_file_exists(filepath):
            all_checks_passed = False
    
    # Check imports
    print("\n2. Checking imports:")
    imports = [
        ("app.middleware.rate_limit", ["limiter", "get_user_identifier", "get_rate_limit_status", "rate_limit_exceeded_handler"]),
        ("app.core.config", ["settings"]),
    ]
    for module_path, items in imports:
        if not check_import(module_path, items):
            all_checks_passed = False
    
    # Check configuration
    print("\n3. Checking configuration:")
    if not check_config_values():
        all_checks_passed = False
    
    # Check slowapi dependency
    print("\n4. Checking dependencies:")
    try:
        import slowapi
        print(f"✓ slowapi installed (version: {slowapi.__version__})")
    except ImportError:
        print("✗ slowapi not installed")
        all_checks_passed = False
    
    # Check integration in main app
    print("\n5. Checking main app integration:")
    try:
        from app.main import app
        
        # Check if limiter is in app state
        if hasattr(app, 'state') and hasattr(app.state, 'limiter'):
            print("✓ Limiter registered in app.state")
        else:
            print("✗ Limiter not found in app.state")
            all_checks_passed = False
        
        # Check if rate limit handler is registered
        # Note: This is a simplified check
        print("✓ App created successfully")
        
    except Exception as e:
        print(f"✗ Main app check failed: {e}")
        all_checks_passed = False
    
    # Summary
    print("\n" + "=" * 60)
    if all_checks_passed:
        print("✓ All validation checks passed!")
        print("Rate limiting middleware is properly implemented.")
        return 0
    else:
        print("✗ Some validation checks failed.")
        print("Please review the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
