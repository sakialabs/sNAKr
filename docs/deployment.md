# Deployment Guide

Complete guide for deploying sNAKr to production.

---

## Table of Contents

- [Overview](#overview)
- [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
- [Backend Deployment (Railway/Fly.io)](#backend-deployment-railwayflyio)
- [Database (Managed PostgreSQL)](#database-managed-postgresql)
- [Redis (Managed)](#redis-managed)
- [MinIO (S3-Compatible Storage)](#minio-s3-compatible-storage)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

sNAKr uses a modern, scalable deployment architecture:

- **Frontend**: Netlify (Next.js with SSR/SSG)
- **Backend**: Railway or Fly.io (FastAPI)
- **Database**: Managed PostgreSQL (Supabase, Neon, or Railway)
- **Cache**: Managed Redis (Upstash or Railway)
- **Storage**: AWS S3 or MinIO
- **Task Queue**: Celery workers on Railway/Fly.io

---

## Frontend Deployment (Netlify)

### Prerequisites

1. Netlify account
2. GitHub repository connected
3. Environment variables configured

### Setup Steps

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Select the `snakr` repository

2. **Configure Build Settings**
   ```
   Base directory: web
   Build command: npm run build
   Publish directory: web/.next
   ```

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://api.snakr.app
   NEXT_PUBLIC_API_BASE_URL=https://api.snakr.app/api/v1
   NEXTAUTH_URL=https://snakr.app
   NEXTAUTH_SECRET=<generate-secure-secret>
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically
   - Set up custom domain (optional)

### Continuous Deployment

Netlify automatically deploys on:
- Push to `main` branch → Production
- Pull requests → Preview deployments

### Custom Domain

1. Go to "Domain settings"
2. Add custom domain: `snakr.app`
3. Configure DNS records
4. Enable HTTPS (automatic with Let's Encrypt)

---

## Backend Deployment (Render/Railway/Fly.io)

### Option 1: Render (Recommended)

#### Prerequisites
- Render account
- GitHub repository connected

#### Setup Steps

1. **Create New Web Service**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `snakr` repository

2. **Configure Service**
   ```
   Name: snakr-api
   Region: Oregon (US West) or closest to your users
   Branch: main
   Root Directory: api
   Runtime: Docker
   Dockerfile Path: api/Dockerfile.prod
   Instance Type: Starter ($7/month) or higher
   ```

3. **Add Environment Variables** (see Environment Variables section below)

4. **Create Background Worker (for Celery)**
   - Click "New +" → "Background Worker"
   - Same repository and settings
   - Start Command: `celery -A celery_app worker --loglevel=info`

5. **Deploy**
   - Render automatically deploys on push to `main`
   - Get public URL: `https://snakr-api.onrender.com`

#### Why Render?
- **Native Docker support**: Works perfectly with FastAPI + Celery
- **Automatic HTTPS**: Free SSL certificates
- **Zero-downtime deploys**: Health checks and rolling updates
- **Persistent disks**: For local file storage if needed
- **PostgreSQL included**: Managed database option
- **Redis included**: Managed Redis option
- **Affordable**: Starts at $7/month
- **Great for Python**: Excellent Python/FastAPI support

### Option 2: Railway

#### Prerequisites
- Railway account
- GitHub repository connected

#### Setup Steps

1. **Create New Project**
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `snakr` repository

2. **Add Services**
   - PostgreSQL (managed)
   - Redis (managed)
   - API service (from Dockerfile)
   - Celery worker (from Dockerfile)

3. **Configure API Service**
   ```
   Root directory: api
   Dockerfile: Dockerfile.dev (or create Dockerfile.prod)
   Port: 8000
   ```

4. **Configure Celery Worker**
   ```
   Root directory: api
   Start command: celery -A celery_app worker --loglevel=info
   ```

5. **Environment Variables** (see below)

6. **Deploy**
   - Railway automatically deploys on push to `main`
   - Get public URL: `https://snakr-api.up.railway.app`

### Option 3: Fly.io

#### Prerequisites
- Fly.io account
- Fly CLI installed

#### Setup Steps

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Create App**
   ```bash
   cd api
   fly launch --name snakr-api
   ```

4. **Configure fly.toml**
   ```toml
   app = "snakr-api"
   primary_region = "iad"

   [build]
     dockerfile = "Dockerfile.prod"

   [env]
     PORT = "8000"

   [[services]]
     internal_port = 8000
     protocol = "tcp"

     [[services.ports]]
       port = 80
       handlers = ["http"]

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

---

## Database (Managed PostgreSQL)

### Option 1: Supabase (Recommended)

1. Create Supabase project
2. Get connection string from Settings → Database
3. Enable Row Level Security (RLS)
4. Run migrations:
   ```bash
   alembic upgrade head
   ```

### Option 2: Neon

1. Create Neon project
2. Get connection string
3. Run migrations

### Option 3: Railway PostgreSQL

1. Add PostgreSQL service in Railway
2. Connection string auto-generated
3. Run migrations

---

## Redis (Managed)

### Option 1: Upstash

1. Create Upstash Redis database
2. Get connection URL
3. Add to environment variables

### Option 2: Railway Redis

1. Add Redis service in Railway
2. Connection URL auto-generated

---

## MinIO (S3-Compatible Storage)

### Option 1: AWS S3

1. Create S3 bucket: `snakr-receipts`
2. Create IAM user with S3 access
3. Get access key and secret key
4. Update environment variables:
   ```
   MINIO_ENDPOINT=s3.amazonaws.com
   MINIO_ACCESS_KEY=<aws-access-key>
   MINIO_SECRET_KEY=<aws-secret-key>
   MINIO_BUCKET=snakr-receipts
   MINIO_SECURE=true
   ```

### Option 2: MinIO Cloud

1. Create MinIO account
2. Create bucket
3. Get credentials
4. Update environment variables

---

## Environment Variables

### Production API Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/snakr

# Redis
REDIS_URL=redis://host:6379/0

# MinIO/S3
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=<access-key>
MINIO_SECRET_KEY=<secret-key>
MINIO_BUCKET=snakr-receipts
MINIO_SECURE=true

# Celery
CELERY_BROKER_URL=redis://host:6379/0
CELERY_RESULT_BACKEND=redis://host:6379/0

# API
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
DEBUG=false

# JWT
JWT_SECRET_KEY=<generate-secure-secret>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS
CORS_ORIGINS=https://snakr.app,https://www.snakr.app

# OCR
OCR_ENABLED=true
TESSERACT_PATH=/usr/bin/tesseract
```

### Production Web Environment Variables

```bash
# API
NEXT_PUBLIC_API_URL=https://api.snakr.app
NEXT_PUBLIC_API_BASE_URL=https://api.snakr.app/api/v1

# NextAuth
NEXTAUTH_URL=https://snakr.app
NEXTAUTH_SECRET=<generate-secure-secret>

# Environment
NODE_ENV=production
```

### Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate NextAuth secret
openssl rand -base64 32
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The deployment pipeline is already configured in `.github/workflows/deploy.yml`:

1. **On Push to Main**
   - Build Docker images
   - Push to GitHub Container Registry
   - Deploy to staging

2. **On Version Tag**
   - Build production images
   - Deploy to production (manual approval)

### Manual Deployment

```bash
# Deploy API to Render (via Git push)
git push origin main

# Or deploy to Railway
railway up

# Deploy Web to Netlify
netlify deploy --prod
```

---

## Monitoring

### Application Monitoring

1. **Sentry** (Error Tracking)
   ```bash
   pip install sentry-sdk
   ```
   
   Add to `api/main.py`:
   ```python
   import sentry_sdk
   
   sentry_sdk.init(
       dsn="<your-sentry-dsn>",
       environment="production"
   )
   ```

2. **Logging**
   - Railway: Built-in logs
   - Fly.io: `fly logs`
   - Netlify: Function logs

### Infrastructure Monitoring

1. **Railway Dashboard**
   - CPU, memory, network usage
   - Service health
   - Deployment history

2. **Uptime Monitoring**
   - Use UptimeRobot or Better Uptime
   - Monitor API health endpoint: `/health`

---

## Troubleshooting

### API Not Responding

1. Check service logs:
   ```bash
   railway logs
   # or
   fly logs
   ```

2. Verify environment variables
3. Check database connection
4. Verify Redis connection

### Database Connection Issues

1. Check connection string
2. Verify database is running
3. Check firewall rules
4. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### Celery Worker Not Processing Tasks

1. Check worker logs
2. Verify Redis connection
3. Restart worker service

### Frontend Not Loading

1. Check Netlify build logs
2. Verify environment variables
3. Check API CORS settings
4. Clear CDN cache

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use secure secrets (32+ characters)
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Enable database SSL
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Monitor security alerts

---

## Cost Estimates

### Minimal Setup (Hobby)
- Netlify: Free
- Render: $7/month (Starter)
- Supabase: Free
- Render Redis: $7/month
- **Total: $14/month**

### Production Setup
- Netlify Pro: $19/month
- Render: $25/month (Standard) + $7/month (Worker)
- Supabase Pro: $25/month
- Render Redis: $10/month
- AWS S3: $5/month
- **Total: $91/month**

---

## Next Steps

1. Set up monitoring and alerts
2. Configure backups
3. Set up staging environment
4. Document runbooks
5. Plan scaling strategy

---

For questions or issues, see [CONTRIBUTING.md](../CONTRIBUTING.md) or open an issue.
