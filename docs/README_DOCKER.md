# Docker README - Baby John Backend

Complete Docker containerization for the Baby John backend with PostgreSQL, FastAPI, and production-ready Nginx reverse proxy.

## 📋 Table of Contents

- [Overview](#overview)
- [Files Created](#files-created)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Environment Setup](#environment-setup)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Baby John is now fully containerized with:
- **PostgreSQL 15** - Database with Alpine Linux (compact, secure)
- **FastAPI** - Python web framework with async support
- **Nginx** - Production reverse proxy with rate limiting
- **pgAdmin** - Database management UI (development only)
- **Docker Compose** - Multi-container orchestration

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Client ──→ Nginx (Reverse Proxy)                   │
│               ├─ Rate Limiting                       │
│               ├─ SSL/TLS (prod)                      │
│               └─ HTTP/2                              │
│                    │                                  │
│                    ▼                                  │
│            FastAPI (Uvicorn/Gunicorn)               │
│            ├─ JWT Authentication                    │
│            ├─ Request Validation                    │
│            └─ Activity CRUD Operations              │
│                    │                                  │
│                    ▼                                  │
│            PostgreSQL 15                            │
│            ├─ Connection Pool                       │
│            ├─ SQLAlchemy ORM                        │
│            └─ Persistent Storage                    │
│                                                       │
│  pgAdmin (dev only): Database Management UI         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Files Created

### Docker Configuration

| File | Purpose | Environment |
|------|---------|-------------|
| `backend/Dockerfile` | Python 3.11 image with security best practices | Both |
| `docker-compose.yml` | Development setup with hot reload | Development |
| `docker-compose.prod.yml` | Production setup with Gunicorn + Nginx | Production |
| `nginx.conf` | Reverse proxy with rate limiting | Production |
| `.dockerignore` | Excludes unnecessary files from build | Both |

### Environment Files

| File | Purpose |
|------|---------|
| `.env.docker` | Development environment template |
| `.env.prod.example` | Production environment template |

### Documentation

| File | Purpose |
|------|---------|
| `DOCKER_SETUP.md` | Comprehensive setup guide (3000+ lines) |
| `DOCKER_QUICKSTART.md` | 5-minute quick start |
| `DOCKER_COMPLETE.md` | Setup completion summary |
| `README.md` (this file) | Docker overview and reference |
| `backend/DEPLOYMENT.md` | Production deployment guide |
| `backend/API_CLIENT.md` | API usage examples |

### Scripts & Tools

| File | Purpose |
|------|---------|
| `verify-docker-setup.sh` | Check Docker setup and prerequisites |
| `docker-compose-manager.sh` | Unified CLI for container management |
| `generate-secret.sh` | Generate secure SECRET_KEY |

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Verify Docker is installed
docker --version    # >= 20.10
docker-compose --version  # >= 1.29
```

### 2. Setup (5 minutes)
```bash
# Navigate to project
cd app_baby

# Copy environment template
cp .env.docker .env

# Start all containers
docker-compose up -d

# Initialize database
docker-compose exec api python init_db.py

# Verify setup
curl http://localhost:8000/api/health
```

### 3. Access Services
```
API Documentation:  http://localhost:8000/docs
API Root:          http://localhost:8000
pgAdmin:           http://localhost:5050
  - Email: admin@example.com
  - Password: admin
```

### 4. Test API
```bash
# Get bearer token
curl -X POST "http://localhost:8000/api/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=papai@example.com&password=password123"

# List activities (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/activities"
```

---

## 🏗️ Architecture

### Development Environment

**Services:**
- **postgres** - PostgreSQL 15 Alpine (5432)
- **api** - FastAPI with hot reload (8000)
- **pgadmin** - Database UI (5050)

**Features:**
- Code volume mount for instant reload
- All ports exposed for debugging
- Health checks on all services
- Auto-restart on failure

### Production Environment

**Services:**
- **postgres** - PostgreSQL 15 optimized (internal only)
- **api** - FastAPI with Gunicorn 4 workers (internal)
- **nginx** - Reverse proxy with TLS (80, 443)

**Features:**
- No hot reload
- Optimized PostgreSQL settings
- 4 Gunicorn workers for concurrency
- Nginx rate limiting
- SSL/TLS support
- Health checks

---

## ⚙️ Environment Setup

### Development (.env.docker)
```bash
# Copy template
cp .env.docker .env

# Key variables
DATABASE_URL=postgresql+psycopg://baby_john_user:baby_john_password@postgres:5432/baby_john_db
SECRET_KEY=your-secret-key-change-in-production
DEBUG=False
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

### Production (.env.prod.example)
```bash
# Copy template
cp .env.prod.example .env.prod

# Generate secure key
bash generate-secret.sh >> .env.prod

# Edit with production values
# - Change all CHANGE_THIS passwords
# - Set correct CORS_ORIGINS
# - Configure SSL certificate paths
# - Set DEBUG=False
```

---

## 🛠️ Common Tasks

### Container Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f postgres

# Restart services
docker-compose restart api

# Remove all (including volumes)
docker-compose down -v
```

### Database Operations
```bash
# Initialize database
docker-compose exec api python init_db.py

# Connect to database
docker-compose exec postgres psql -U baby_john_user -d baby_john_db

# Backup database
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U baby_john_user baby_john_db < backup.sql

# Run database migrations
docker-compose exec api python -m alembic upgrade head
```

### Testing
```bash
# Run tests
docker-compose exec api pytest

# Run tests with coverage
docker-compose exec api pytest --cov=.

# Run specific test file
docker-compose exec api pytest tests/test_activities.py
```

### Development
```bash
# View container stats
docker stats

# Execute bash in container
docker-compose exec api bash

# Install new Python package
docker-compose exec api pip install package-name

# Rebuild after dependencies change
docker-compose build --no-cache
docker-compose up -d
```

### Production Deployment
```bash
# Deploy with production compose file
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# View production logs
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f api

# Backup production database
docker-compose -f docker-compose.prod.yml --env-file .env.prod \
  exec postgres pg_dump -U $DB_USER $DB_NAME > backup_prod.sql
```

### Using Management Script
```bash
# Make executable
chmod +x docker-compose-manager.sh

# Start development
./docker-compose-manager.sh up dev

# View logs
./docker-compose-manager.sh logs dev

# Backup production
./docker-compose-manager.sh backup prod

# Restore from backup
./docker-compose-manager.sh restore prod backup_20260909_120000.sql
```

---

## 📊 Verification

### Automated Verification
```bash
# Run setup checker
bash verify-docker-setup.sh
```

### Manual Verification
```bash
# 1. Check Docker daemon
docker ps

# 2. Check containers
docker-compose ps

# 3. Health check
curl http://localhost:8000/api/health

# 4. Check logs
docker-compose logs api

# 5. Test database
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"

# 6. Test API
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/activities
```

---

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs api

# Common causes:
# - Database not ready: wait 10-15 seconds
# - PORT already in use: change in .env
# - Missing .env file: cp .env.docker .env
# - Out of disk space: docker system prune -a
```

### Database Connection Failed
```bash
# Check if postgres is running
docker-compose ps postgres

# Check credentials in .env
grep DATABASE .env

# Test connection manually
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"
```

### API Returns 500 Errors
```bash
# Check API logs
docker-compose logs -f api

# Check database connection
docker-compose exec api python -c "from database import engine; engine.connect()"

# Verify environment variables
docker-compose exec api env | grep SECRET_KEY
```

### High Memory Usage
```bash
# Check container stats
docker stats

# Reduce Gunicorn workers (production)
# Edit docker-compose.prod.yml:
# command: gunicorn main:app --workers 2 ...

# Restart
docker-compose restart api
```

### Slow Queries
```bash
# Enable PostgreSQL query logging
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "
  ALTER SYSTEM SET log_min_duration_statement = 1000;
"

# Reload config
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT pg_reload_conf();"

# View logs
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log
```

---

## 🔐 Security Considerations

### Development
- ⚠️ DEBUG=False (already set)
- ⚠️ CORS_ORIGINS limited to localhost
- ⚠️ Default database credentials (change if exposed)

### Production
- ✅ Generate strong SECRET_KEY: `bash generate-secret.sh`
- ✅ Use strong database password
- ✅ Configure SSL/TLS certificates
- ✅ Set CORS_ORIGINS to your domain
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Regular backups
- ✅ Monitor logs
- ✅ Keep images updated

---

## 📚 Documentation Structure

```
Documentation Tree:
├── README.md (this file)
│   └── Overview and quick reference
├── DOCKER_QUICKSTART.md
│   └── 5-minute setup guide
├── DOCKER_SETUP.md
│   └── Comprehensive setup guide (3000+ lines)
├── DOCKER_COMPLETE.md
│   └── Setup completion checklist
├── backend/DEPLOYMENT.md
│   └── Production deployment procedures
├── backend/API_CLIENT.md
│   └── API usage and integration examples
└── backend/README.md
    └── Backend architecture overview
```

**Start here:** DOCKER_QUICKSTART.md (5 minutes)  
**Detailed setup:** DOCKER_SETUP.md (comprehensive)  
**Production deployment:** backend/DEPLOYMENT.md

---

## 📦 Image Sizes

### Development
- Python 3.11-slim base: ~150MB
- With dependencies: ~300MB
- Built image: ~350MB

### Production
- Same base, optimized: ~350MB
- Nginx Alpine: ~20MB
- PostgreSQL Alpine: ~80MB
- **Total size:** ~450MB

---

## 🚢 Deployment Options

### Local Development
```bash
docker-compose up -d
```

### Docker Hub
```bash
docker tag baby_john_api:latest yourusername/baby_john_api:1.0.0
docker push yourusername/baby_john_api:1.0.0
```

### AWS ECS
```bash
aws ecr create-repository --repository-name baby_john_api
docker tag baby_john_api:latest {account_id}.dkr.ecr.us-east-1.amazonaws.com/baby_john_api:1.0.0
docker push {account_id}.dkr.ecr.us-east-1.amazonaws.com/baby_john_api:1.0.0
```

### DigitalOcean / Heroku / etc.
See backend/DEPLOYMENT.md for detailed instructions

---

## 🆘 Getting Help

### Check Documentation
1. DOCKER_QUICKSTART.md - Fast setup
2. DOCKER_SETUP.md - Comprehensive guide
3. DEPLOYMENT.md - Production setup
4. API_CLIENT.md - API examples

### Debug Steps
1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Test health: `curl http://localhost:8000/api/health`
4. Run verification: `bash verify-docker-setup.sh`

### Common Issues
- Port in use → Change in .env
- DB not ready → Wait 10-15 seconds
- Missing .env → `cp .env.docker .env`
- Permission denied → `chmod +x *.sh`

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-09 | Initial Docker setup |

---

## ✅ What's Next

1. **Immediate:**
   - [ ] `cp .env.docker .env`
   - [ ] `docker-compose up -d`
   - [ ] `docker-compose exec api python init_db.py`
   - [ ] Verify at http://localhost:8000/docs

2. **Today:**
   - [ ] Review DOCKER_SETUP.md
   - [ ] Test API endpoints
   - [ ] Review DEPLOYMENT.md

3. **Before Production:**
   - [ ] Generate SECRET_KEY
   - [ ] Configure SSL certificates
   - [ ] Set production database
   - [ ] Review security checklist
   - [ ] Run load tests
   - [ ] Setup monitoring/logging

---

**Status:** ✅ Docker setup complete  
**Last Updated:** 2026-09-09  
**Maintainer:** Claude Code

For support, see DOCKER_SETUP.md or backend/DEPLOYMENT.md
