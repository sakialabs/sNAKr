# CI/CD Documentation

This document provides a comprehensive overview of the CI/CD setup for sNAKr.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Local Development](#local-development)
- [Code Quality Tools](#code-quality-tools)
- [Security Scanning](#security-scanning)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

sNAKr uses GitHub Actions for continuous integration and continuous deployment (CI/CD). The CI/CD pipeline ensures code quality, runs tests, builds Docker images, and performs security scans on every pull request and push to main branches.

### Key Features

- ✅ **Automated Testing**: Unit tests run on every PR
- ✅ **Code Quality**: Linting and formatting checks
- ✅ **Type Safety**: TypeScript type checking
- ✅ **Security**: Vulnerability scanning with Trivy and Bandit
- ✅ **Docker Builds**: Automated container builds
- ✅ **Dependency Updates**: Automated with Dependabot
- ✅ **Code Coverage**: Coverage reports with Codecov

---

## GitHub Actions Workflows

### CI Pipeline (`.github/workflows/ci.yml`)

Runs on: `push` and `pull_request` to `main` and `develop` branches

**Jobs:**

1. **api-lint-test**: Python linting and testing
   - Black (code formatting)
   - isort (import sorting)
   - Flake8 (linting)
   - pytest (unit tests)
   - Coverage reporting

2. **web-lint-typecheck**: TypeScript linting and type checking
   - ESLint (linting)
   - TypeScript compiler (type checking)
   - Build verification

3. **docker-build**: Docker image builds
   - API Docker image
   - Web Docker image
   - Docker Compose validation

4. **security-scan**: Security vulnerability scanning
   - Trivy (dependency vulnerabilities)
   - Bandit (Python security issues)

5. **ci-success**: Summary job
   - Ensures all checks passed

### Deploy Pipeline (`.github/workflows/deploy.yml`)

Runs on: `push` to `main` and version tags (`v*`)

**Jobs:**

1. **build-and-push**: Build and push Docker images
   - Builds production images
   - Pushes to GitHub Container Registry
   - Tags with version/branch/sha

2. **deploy-staging**: Deploy to staging environment
   - Runs on `main` branch pushes
   - Placeholder for deployment logic

3. **deploy-production**: Deploy to production
   - Runs on version tag pushes
   - Requires manual approval

---

## Local Development

### Running CI Checks Locally

Before pushing code, run CI checks locally to catch issues early:

```bash
# Format API code
make ci-format-api

# Lint API code
make ci-lint-api

# Lint web code
make ci-lint-web

# Run API tests
make ci-test-api

# Run all CI checks
make ci-all
```

### Manual Commands

**Python (API):**

```bash
cd api

# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Type check
mypy .

# Security scan
bandit -r .

# Run tests
pytest --cov=. --cov-report=html
```

**TypeScript (Web):**

```bash
cd web

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type check
npm run type-check

# Build
npm run build
```

---

## Code Quality Tools

### Python Tools

#### Black (Code Formatter)

- **Purpose**: Automatic code formatting
- **Config**: `api/pyproject.toml`
- **Line length**: 100 characters
- **Target**: Python 3.11

**Usage:**
```bash
black .                 # Format all files
black --check .         # Check without modifying
black --diff .          # Show what would change
```

#### isort (Import Sorter)

- **Purpose**: Sort and organize imports
- **Config**: `api/pyproject.toml`
- **Profile**: Black-compatible

**Usage:**
```bash
isort .                 # Sort all imports
isort --check-only .    # Check without modifying
isort --diff .          # Show what would change
```

#### Flake8 (Linter)

- **Purpose**: Code linting and style checking
- **Config**: `api/.flake8`
- **Max line length**: 100 characters
- **Max complexity**: 10

**Usage:**
```bash
flake8 .                # Lint all files
flake8 --statistics .   # Show statistics
```

#### mypy (Type Checker)

- **Purpose**: Static type checking
- **Config**: `api/pyproject.toml`
- **Python version**: 3.11

**Usage:**
```bash
mypy .                  # Type check all files
mypy --strict .         # Strict mode
```

#### Bandit (Security Scanner)

- **Purpose**: Find common security issues
- **Config**: `api/pyproject.toml`
- **Excludes**: tests, migrations

**Usage:**
```bash
bandit -r .             # Scan all files
bandit -r . -f json     # JSON output
```

### TypeScript Tools

#### ESLint (Linter)

- **Purpose**: Code linting and style checking
- **Config**: `web/.eslintrc.json`
- **Extends**: `next/core-web-vitals`

**Usage:**
```bash
npm run lint            # Lint all files
npm run lint -- --fix   # Fix issues automatically
```

#### TypeScript Compiler (Type Checker)

- **Purpose**: Type checking
- **Config**: `web/tsconfig.json`

**Usage:**
```bash
npm run type-check      # Check types
tsc --noEmit           # Same as above
```

---

## Security Scanning

### Trivy (Vulnerability Scanner)

Trivy scans for known vulnerabilities in:
- Dependencies (npm, pip)
- Docker images
- Configuration files

**Severity Levels:**
- CRITICAL: Must fix immediately
- HIGH: Should fix soon
- MEDIUM: Fix when possible
- LOW: Optional

**Results:**
- Uploaded to GitHub Security tab
- Available in "Code scanning alerts"

### Bandit (Python Security)

Bandit scans Python code for:
- Hardcoded passwords
- SQL injection vulnerabilities
- Insecure cryptography
- Shell injection
- Unsafe YAML loading

**Results:**
- Uploaded as artifacts
- Available in workflow run

---

## Deployment

### Staging Deployment

**Trigger:** Push to `main` branch

**Process:**
1. CI pipeline passes
2. Docker images built and pushed
3. Deployment to staging environment
4. Health checks

**Environment:**
- Name: `staging`
- URL: https://staging.snakr.app (placeholder)

### Production Deployment

**Trigger:** Push version tag (e.g., `v1.0.0`)

**Process:**
1. CI pipeline passes
2. Docker images built and pushed
3. Manual approval required
4. Deployment to production
5. Health checks

**Environment:**
- Name: `production`
- URL: https://snakr.app (placeholder)

### Creating a Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# Or create a GitHub release
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"
```

### Setting Up Deployment

To enable actual deployment:

1. **Configure GitHub Environments:**
   - Go to Settings > Environments
   - Create `staging` and `production` environments
   - Add required secrets
   - Enable required reviewers for production

2. **Add Deployment Secrets:**
   - `DEPLOY_KEY`: SSH key for deployment
   - `KUBE_CONFIG`: Kubernetes configuration
   - `AWS_ACCESS_KEY_ID`: AWS credentials (if using AWS)
   - `AWS_SECRET_ACCESS_KEY`: AWS credentials (if using AWS)

3. **Update Deployment Steps:**
   - Edit `.github/workflows/deploy.yml`
   - Replace placeholder commands with actual deployment logic
   - Examples: kubectl, helm, terraform, etc.

---

## Troubleshooting

### CI Pipeline Failures

#### Black Formatting Fails

**Error:** Code is not formatted correctly

**Solution:**
```bash
cd api
black .
git add .
git commit -m "chore: format code with black"
```

#### isort Fails

**Error:** Imports are not sorted correctly

**Solution:**
```bash
cd api
isort .
git add .
git commit -m "chore: sort imports with isort"
```

#### Flake8 Fails

**Error:** Linting errors

**Solution:**
1. Fix the errors manually
2. Or add exceptions to `.flake8`:
   ```ini
   [flake8]
   per-file-ignores =
       specific_file.py:E501
   ```

#### Tests Fail

**Error:** Unit tests failing

**Solution:**
1. Run tests locally: `pytest`
2. Fix the failing tests
3. Ensure all dependencies are installed
4. Check for environment-specific issues

#### Type Check Fails

**Error:** TypeScript type errors

**Solution:**
```bash
cd web
npm run type-check
# Fix type errors
```

### Docker Build Failures

**Error:** Docker build fails

**Common causes:**
- Missing dependencies in requirements.txt or package.json
- Dockerfile syntax errors
- Network issues

**Solution:**
1. Test build locally: `docker build -t test ./api`
2. Check Dockerfile syntax
3. Verify all dependencies are listed

### Security Scan Failures

**Error:** Vulnerabilities found

**Solution:**
1. Review vulnerabilities in GitHub Security tab
2. Update vulnerable dependencies:
   ```bash
   # Python
   pip install --upgrade package-name
   
   # Node.js
   npm update package-name
   ```
3. If no fix available, add to exceptions (with justification)

### Deployment Failures

**Error:** Deployment fails

**Common causes:**
- Missing secrets
- Invalid configuration
- Network issues
- Health check failures

**Solution:**
1. Check deployment logs
2. Verify secrets are configured
3. Test deployment locally
4. Check health check endpoints

---

## Best Practices

### Before Committing

1. Run local CI checks: `make ci-all`
2. Run tests: `make ci-test-api`
3. Review changes: `git diff`
4. Write clear commit messages

### Pull Requests

1. Ensure CI passes before requesting review
2. Add tests for new features
3. Update documentation
4. Keep PRs focused and small
5. Respond to review comments

### Dependencies

1. Keep dependencies up to date
2. Review Dependabot PRs promptly
3. Test dependency updates locally
4. Check for breaking changes

### Security

1. Never commit secrets or credentials
2. Review security scan results
3. Update vulnerable dependencies promptly
4. Use environment variables for configuration

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Black Documentation](https://black.readthedocs.io/)
- [Flake8 Documentation](https://flake8.pycqa.org/)
- [ESLint Documentation](https://eslint.org/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

---

## Questions?

If you have questions about the CI/CD setup:
1. Check this documentation
2. Review workflow files in `.github/workflows/`
3. Open an issue for clarification
4. Ask in discussions

