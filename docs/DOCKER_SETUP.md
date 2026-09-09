# Docker Setup Guide - Baby John Backend

## 🐳 Docker & Docker Compose Setup

### Prerequisites
- Docker 20.10+
- Docker Compose 1.29+

### Quick Start

#### Development Environment (5 min)
```bash
# Clone/navigate to project
cd app_baby

# Copy environment file
cp .env.docker .env

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec api python init_db.py

# Verify everything
docker-compose ps
```

#### Access Services
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **pgAdmin:** http://localhost:5050
  - Email: admin@example.com
  - Password: admin

### Docker Compose Services

#### Development (docker-compose.yml)
```
postgres:
  - Database
  - Port: 5432
  - Volume: postgres_data
  - Health check: Yes

api:
  - FastAPI application
  - Port: 8000
  - Volume: ./backend (for hot reload)
  - Depends on: postgres
  - Health check: Yes

pgadmin:
  - Database management UI
  - Port: 5050
  - Volume: pgadmin_data
```

#### Production (docker-compose.prod.yml)
```
postgres:
  - Optimized for production
  - Tuned parameters
  - Persistent volumes

api:
  - Gunicorn with 4 workers
  - No hot reload
  - Health checks

nginx:
  - Reverse proxy
  - Load balancing
  - SSL support
```

### Common Commands

#### Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api

# Show running containers
docker-compose ps

# Rebuild images
docker-compose build

# Clean up (removes volumes)
docker-compose down -v
```

#### Database Operations
```bash
# Initialize database
docker-compose exec api python init_db.py

# Run tests
docker-compose exec api python test_api.py

# Validate schema
docker-compose exec api python validate_schema.py

# Access PostgreSQL shell
docker-compose exec postgres psql -U baby_john_user -d baby_john_db
```

#### Backup & Restore
```bash
# Backup database
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U baby_john_user baby_john_db < backup.sql
```

### Using docker-compose-manager.sh

```bash
# Make script executable
chmod +x docker-compose-manager.sh

# Development
./docker-compose-manager.sh up dev
./docker-compose-manager.sh logs dev
./docker-compose-manager.sh down dev

# Production
./docker-compose-manager.sh up prod
./docker-compose-manager.sh backup prod

# Examples
./docker-compose-manager.sh init-db dev
./docker-compose-manager.sh restore prod backup_20260909_120000.sql
```

### Environment Variables

Create `.env` file:
```bash
cp .env.docker .env
```

Key variables:
```
DATABASE_URL=postgresql+psycopg://baby_john_user:baby_john_password@postgres:5432/baby_john_db
SECRET_KEY=your-secret-key-change-in-production
API_PORT=8000
DEBUG=False
```

### Dockerfile Optimization

Features:
- ✅ Multi-stage build (ready for future optimization)
- ✅ Non-root user (security)
- ✅ Health checks
- ✅ Slim Python 3.11 base image
- ✅ Minimal layers
- ✅ System dependencies only when needed

### Docker Compose Features

#### Development
- Hot reload enabled
- Volume mounts for code
- pgAdmin for DB management
- Exposed ports for debugging

#### Production
- Gunicorn + Uvicorn workers
- Nginx reverse proxy
- SSL/TLS ready
- Optimized PostgreSQL settings
- No hot reload

### Health Checks

Both development and production include health checks:
- **API:** HTTP GET /api/health
- **PostgreSQL:** pg_isready check
- Automatic restart on unhealthy containers

### Troubleshooting

#### Container won't start
```bash
docker-compose logs api
docker-compose logs postgres
```

#### Database connection error
```bash
# Check if postgres is running
docker-compose ps postgres

# Check database
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"
```

#### Port already in use
```bash
# Change port in .env
API_PORT=8001
DB_PORT=5433

# Restart
docker-compose down
docker-compose up -d
```

#### Out of space
```bash
# Clean up unused images/volumes
docker system prune -a --volumes
```

### Production Deployment

1. **Use docker-compose.prod.yml**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

2. **Configure SSL/TLS**
   - Update nginx.conf with SSL certificates
   - Point to `/etc/nginx/ssl` directory

3. **Environment File**
```bash
# Create .env.prod with production values
SECRET_KEY=your-production-secret-key-12345
DEBUG=False
CORS_ORIGINS=["https://yourdomain.com"]
```

4. **Backup Strategy**
```bash
# Automated daily backups
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

5. **Monitoring**
```bash
docker-compose logs -f api
docker-compose logs -f postgres
docker stats
```

### Files Created

- **Dockerfile** - Production-ready Python 3.11 image
- **docker-compose.yml** - Development environment
- **docker-compose.prod.yml** - Production environment
- **.dockerignore** - Exclude files from build
- **.env.docker** - Environment template
- **nginx.conf** - Reverse proxy configuration
- **docker-compose-manager.sh** - Management script

### Next Steps

1. Copy .env.docker to .env
2. Run: `docker-compose up -d`
3. Initialize DB: `docker-compose exec api python init_db.py`
4. Access: http://localhost:8000/docs
5. Read: backend/DEPLOYMENT.md for production setup

---

**Version:** 1.0.0  
**Last Updated:** 2026-09-09
