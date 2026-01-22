"""
Verification script for FastAPI project structure
This script checks that all required directories and files exist
"""
import os
import sys
from pathlib import Path

def check_structure():
    """Check that all required directories and files exist"""
    
    base_dir = Path(__file__).parent.parent
    
    required_structure = {
        "directories": [
            "app",
            "app/core",
            "app/middleware",
            "app/models",
            "app/routes",
            "app/routes/api_v1",
            "app/services",
            "tests",
            "scripts",
        ],
        "files": [
            "main.py",
            "requirements.txt",
            "README.md",
            ".env.example",
            "app/__init__.py",
            "app/main.py",
            "app/core/__init__.py",
            "app/core/config.py",
            "app/core/errors.py",
            "app/core/logging.py",
            "app/middleware/__init__.py",
            "app/models/__init__.py",
            "app/routes/__init__.py",
            "app/routes/health.py",
            "app/routes/api_v1/__init__.py",
            "app/services/__init__.py",
            "app/services/supabase_client.py",
            "tests/__init__.py",
            "tests/test_main.py",
        ]
    }
    
    print("🔍 Verifying FastAPI project structure...\n")
    
    all_good = True
    
    # Check directories
    print("📁 Checking directories:")
    for directory in required_structure["directories"]:
        dir_path = base_dir / directory
        if dir_path.exists() and dir_path.is_dir():
            print(f"  ✅ {directory}")
        else:
            print(f"  ❌ {directory} - MISSING")
            all_good = False
    
    print()
    
    # Check files
    print("📄 Checking files:")
    for file in required_structure["files"]:
        file_path = base_dir / file
        if file_path.exists() and file_path.is_file():
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} - MISSING")
            all_good = False
    
    print()
    
    # Check key features
    print("🔧 Checking key features:")
    
    features = {
        "CORS Configuration": check_cors_config(base_dir),
        "Error Handling": check_error_handling(base_dir),
        "Health Check Endpoint": check_health_endpoint(base_dir),
        "Logging Setup": check_logging(base_dir),
        "Supabase Client": check_supabase_client(base_dir),
    }
    
    for feature, exists in features.items():
        if exists:
            print(f"  ✅ {feature}")
        else:
            print(f"  ❌ {feature} - NOT CONFIGURED")
            all_good = False
    
    print()
    
    if all_good:
        print("✨ All checks passed! FastAPI project structure is complete.")
        return 0
    else:
        print("⚠️  Some checks failed. Please review the missing items above.")
        return 1


def check_cors_config(base_dir):
    """Check if CORS is configured"""
    main_file = base_dir / "app" / "main.py"
    if main_file.exists():
        content = main_file.read_text()
        return "CORSMiddleware" in content
    return False


def check_error_handling(base_dir):
    """Check if error handling is set up"""
    errors_file = base_dir / "app" / "core" / "errors.py"
    if errors_file.exists():
        content = errors_file.read_text()
        return "SNAKrException" in content and "snakr_exception_handler" in content
    return False


def check_health_endpoint(base_dir):
    """Check if health endpoint exists"""
    health_file = base_dir / "app" / "routes" / "health.py"
    if health_file.exists():
        content = health_file.read_text()
        return "/health" in content
    return False


def check_logging(base_dir):
    """Check if logging is configured"""
    logging_file = base_dir / "app" / "core" / "logging.py"
    if logging_file.exists():
        content = logging_file.read_text()
        return "setup_logging" in content
    return False


def check_supabase_client(base_dir):
    """Check if Supabase client is set up"""
    supabase_file = base_dir / "app" / "services" / "supabase_client.py"
    if supabase_file.exists():
        content = supabase_file.read_text()
        return "get_supabase" in content and "SupabaseService" in content
    return False


if __name__ == "__main__":
    sys.exit(check_structure())
