# Baby John Backend - Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Database Management](#database-management)
5. [Monitoring & Logging](#monitoring--logging)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
```bash
Python 3.11+
PostgreSQL 14+
pip (Python package manager)
```

### Setup

#### 1. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your local settings
# At minimum, set:
# DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/baby_john_db
# SECRET_KEY=your-local-dev-secret-key
```

#### 4. Initialize Database
```bash
# Run migrations and seed data
python init_db.py

# Verify schema
python validate_schema.py
```

#### 5. Start Development Server
```bash
# Hot reload enabled
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or with logging
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level info
```

#### 6. Verify Installation
```bash
# In another terminal
curl http://localhost:8000/api/health

# Response should be:
# {"status": "healthy", "timestamp": "2026-09-09T..."}
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_activities.py

# Run with verbose output
pytest -v
```

---

## Docker Deployment

### Development Environment

#### Quick Start (5 minutes)
```bash
# Navigate to project root
cd app_baby

# Copy environment
cp .env.docker .env

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec api python init_db.py

# Verify
docker-compose ps
```

#### Access
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- pgAdmin: http://localhost:5050
  - Email: admin@example.com
  - Password: admin

#### Common Commands
```bash
# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose build --no-cache

# Remove everything (volumes included)
docker-compose down -v

# Database shell
docker-compose exec postgres psql -U baby_john_user -d baby_john_db
```

---

## Production Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 1.29+
- SSL/TLS certificates
- Domain name
- PostgreSQL managed service (AWS RDS, DigitalOcean, etc.) - optional

### Deployment Steps

#### 1. Prepare Production Environment
```bash
# Create .env.prod with production values
cat > .env.prod << EOF
DATABASE_URL=postgresql+psycopg://prod_user:secure_password@db.example.com:5432/baby_john_prod
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DEBUG=False
LOG_LEVEL=INFO
CORS_ORIGINS=["https://yourdomain.com"]
DB_POOL_SIZE=50
DB_MAX_OVERFLOW=20
ENABLE_PROFILING=False
ENABLE_METRICS=True
EOF
```

#### 2. Configure SSL/TLS
```bash
# Create ssl directory
mkdir -p ssl

# Copy certificates
cp /path/to/cert.pem ssl/
cp /path/to/key.pem ssl/

# Update nginx.conf with SSL settings:
# - Enable ssl_certificate and ssl_certificate_key
# - Set ssl_protocols and ssl_ciphers
# - Enable HSTS header
```

#### 3. Build and Deploy
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Push to registry (optional)
docker tag baby_john_api:latest your-registry/baby_john_api:1.0.0
docker push your-registry/baby_john_api:1.0.0

# Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Initialize database (first time only)
docker-compose -f docker-compose.prod.yml --env-file .env.prod exec api python init_db.py

# Verify
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps
```

#### 4. Post-Deployment Checks
```bash
# Health check
curl https://yourdomain.com/api/health

# Verify database connection
docker-compose -f docker-compose.prod.yml --env-file .env.prod exec api python -c "from db import get_session; print('DB OK')"

# Check logs
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f api
```

#### 5. Setup Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"

docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
    -U $DB_USER $DB_NAME | gzip > "$BACKUP_FILE"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_FILE" s3://your-bucket/backups/

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x backup.sh

# Schedule with cron (daily at 2 AM)
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### Cloud Deployment Options

#### AWS ECS
```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name baby_john_api

# 2. Push image
docker tag baby_john_api:latest {account_id}.dkr.ecr.us-east-1.amazonaws.com/baby_john_api:1.0.0
docker push {account_id}.dkr.ecr.us-east-1.amazonaws.com/baby_john_api:1.0.0

# 3. Create ECS task definition and service
# (Use AWS console or CDK)
```

#### DigitalOcean App Platform
```bash
# 1. Create app.yaml
cat > app.yaml << EOF
name: baby-john-api
services:
  - name: api
    github:
      repo: yourusername/baby_john
      branch: main
    build_command: "pip install -r requirements.txt"
    run_command: "gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker"
    envs:
      - key: DATABASE_URL
        value: ${db.connection_string}
    http_port: 8000
databases:
  - name: db
    engine: PG
    version: "15"
EOF

# 2. Deploy
doctl apps create --spec app.yaml
```

#### Heroku
```bash
# 1. Create Procfile
echo "web: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker" > Procfile

# 2. Create app
heroku create baby-john-api

# 3. Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 4. Set environment
heroku config:set SECRET_KEY=$(openssl rand -hex 32)

# 5. Deploy
git push heroku main
```

---

## Database Management

### Backups

#### Local Development
```bash
# Backup
pg_dump -U baby_john_user -h localhost baby_john_db > backup.sql

# Backup compressed
pg_dump -U baby_john_user -h localhost baby_john_db | gzip > backup.sql.gz

# Restore
psql -U baby_john_user -h localhost baby_john_db < backup.sql
```

#### Docker
```bash
# Backup
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U baby_john_user baby_john_db < backup.sql
```

#### Production
```bash
# Using management script
./docker-compose-manager.sh backup prod

# Manual
docker-compose -f docker-compose.prod.yml exec postgres pg_dump \
    -U $DB_USER $DB_NAME | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Migrations

#### Initial Setup
```bash
# Create migration directory
mkdir -p migrations

# Initialize Alembic (if using)
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

#### Adding New Columns
```python
# migrations/versions/002_add_column.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('activities', sa.Column('new_column', sa.String(), nullable=True))

def downgrade():
    op.drop_column('activities', 'new_column')
```

### Database Maintenance

```bash
# Analyze query performance
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "ANALYZE;"

# Vacuum (reclaim space)
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "VACUUM ANALYZE;"

# Check database size
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT pg_size_pretty(pg_database_size('baby_john_db'));"

# List connections
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT * FROM pg_stat_activity;"
```

---

## Monitoring & Logging

### Application Logs

#### Development
```bash
# View logs in real-time
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Logs from specific time
docker-compose logs --since 2h api
```

#### Production
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Save logs to file
docker-compose -f docker-compose.prod.yml logs api > app.log

# Stream logs to file
docker-compose -f docker-compose.prod.yml logs -f api >> /var/log/baby-john-api.log
```

### Database Logs

```bash
# PostgreSQL logs
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log

# Slow queries
# In PostgreSQL, enable:
# log_min_duration_statement = 1000  # 1 second
```

### Monitoring with Prometheus/Grafana (Optional)

```yaml
# docker-compose.monitoring.yml
version: '3.9'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
```

---

## Security Checklist

### Pre-Deployment
- [ ] Generate strong `SECRET_KEY` (32+ chars random)
- [ ] Set `DEBUG=False`
- [ ] Enable SSL/TLS certificates
- [ ] Configure CORS for specific domains
- [ ] Set strong database password
- [ ] Review and restrict CORS_ORIGINS
- [ ] Enable rate limiting
- [ ] Configure HTTPS redirects
- [ ] Test SQL injection prevention
- [ ] Verify JWT token validation

### Post-Deployment
- [ ] Test health endpoint
- [ ] Verify database connectivity
- [ ] Check API documentation is not exposed
- [ ] Monitor error logs
- [ ] Test rate limiting
- [ ] Verify SSL/TLS certificate
- [ ] Check backup strategy
- [ ] Monitor resource usage
- [ ] Setup alerts
- [ ] Conduct security scan

### Ongoing
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review access logs weekly
- [ ] Test disaster recovery
- [ ] Update database backups
- [ ] Monitor performance metrics

---

## Troubleshooting

### API Won't Start

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Database connection string invalid
# 2. PostgreSQL not running
# 3. Port already in use
# 4. Missing environment variables
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"

# Check environment variables
docker-compose exec api env | grep DATABASE
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8000

# Change port in .env
API_PORT=8001

# Restart
docker-compose down
docker-compose up -d
```

### Out of Memory

```bash
# Check usage
docker stats

# Reduce worker count in docker-compose.prod.yml
command: gunicorn main:app --workers 2 ...

# Restart
docker-compose restart api
```

### Slow Queries

```bash
# Enable query logging
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "
  ALTER SYSTEM SET log_min_duration_statement = 1000;
"

# Reload configuration
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT pg_reload_conf();"

# View slow queries
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-09 | Initial deployment guide |

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f api`
2. Review error messages in database
3. Check connectivity: `curl http://localhost:8000/api/health`
4. Verify environment variables: `docker-compose exec api env`

---

**Last Updated:** 2026-09-09
