"""
Verify OpenAPI documentation is properly configured
"""
import json
from app.main import create_app

def verify_openapi():
    """Verify OpenAPI schema is generated correctly"""
    print("Creating FastAPI app...")
    app = create_app()
    
    print("\n✓ App created successfully")
    
    # Get OpenAPI schema
    print("\nGenerating OpenAPI schema...")
    openapi_schema = app.openapi()
    
    print(f"\n✓ OpenAPI schema generated")
    print(f"  - Title: {openapi_schema.get('info', {}).get('title')}")
    print(f"  - Version: {openapi_schema.get('info', {}).get('version')}")
    print(f"  - OpenAPI Version: {openapi_schema.get('openapi')}")
    
    # Check paths
    paths = openapi_schema.get('paths', {})
    print(f"\n✓ API Endpoints: {len(paths)} paths defined")
    
    # List all endpoints
    print("\nAvailable endpoints:")
    for path in sorted(paths.keys()):
        methods = list(paths[path].keys())
        print(f"  - {path}: {', '.join(methods).upper()}")
    
    # Check tags
    tags = openapi_schema.get('tags', [])
    print(f"\n✓ API Tags: {len(tags)} tags defined")
    for tag in tags:
        print(f"  - {tag.get('name')}: {tag.get('description', 'No description')[:60]}...")
    
    # Check components/schemas
    schemas = openapi_schema.get('components', {}).get('schemas', {})
    print(f"\n✓ Data Models: {len(schemas)} schemas defined")
    
    # Save to file for inspection
    output_file = "openapi_schema.json"
    with open(output_file, 'w') as f:
        json.dump(openapi_schema, f, indent=2)
    
    print(f"\n✓ OpenAPI schema saved to: {output_file}")
    print("\n✅ OpenAPI documentation is properly configured!")
    print("\nTo view the documentation:")
    print("  1. Start the server: python main.py")
    print("  2. Visit: http://localhost:8000/docs")
    print("  3. Or visit: http://localhost:8000/redoc")
    
    return True

if __name__ == "__main__":
    try:
        verify_openapi()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
