# Docker Troubleshooting Guide

Common Docker issues and solutions for Baby John backend.

## 🔴 Container Issues

### Container Won't Start

**Problem:** Docker container fails to start or exits immediately

**Debug Steps:**
```bash
# Check logs
docker-compose logs api

# Check container status
docker-compose ps

# Inspect container
docker-compose exec api bash  # May not work if container exits

# View detailed error
docker-compose up api  # Run in foreground to see errors
```

**Common Causes & Solutions:**

#### 1. Database Connection Failed
```bash
# Check if postgres is running
docker-compose ps postgres

# Check database credentials in .env
grep DATABASE_URL .env

# Test connection
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"

# Solution: Wait 10-15 seconds for database to be ready
```

#### 2. Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Solution: Change port in .env
sed -i 's/API_PORT=8000/API_PORT=8001/' .env
docker-compose down && docker-compose up -d
```

#### 3. Memory/Disk Issues
```bash
# Check disk space
df -h

# Check memory
free -h
docker stats

# Solution: Free up space or increase resources
docker system prune -a  # Clean up unused images
```

#### 4. Permission Denied
```bash
# Fix file permissions
chmod +x *.sh
sudo chown -R $USER:$USER ./

# In container, check user
docker-compose exec api whoami
```

---

## 🟠 Database Issues

### Database Connection Timeout

**Problem:** API can't connect to PostgreSQL

**Debug:**
```bash
# Check postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection
docker exec baby_john_postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"

# Check network
docker network ls
docker network inspect baby_john_network
```

**Solutions:**
```bash
# Wait for postgres to be ready
docker-compose exec postgres pg_isready

# Restart postgres
docker-compose restart postgres

# Rebuild from scratch
docker-compose down -v
docker-compose up -d
docker-compose exec api python init_db.py
```

### Database Connection Pool Exhausted

**Problem:** "Connection pool is at maximum size"

**Diagnosis:**
```bash
# Check active connections
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT count(*) FROM pg_stat_activity;"

# List all connections
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT * FROM pg_stat_activity;"
```

**Solutions:**
```bash
# Restart API to reset connections
docker-compose restart api

# Increase pool size in .env
DB_POOL_SIZE=30
DB_MAX_OVERFLOW=15

# Restart
docker-compose down && docker-compose up -d
```

### Disk Space Full

**Problem:** "No space left on device"

**Check:**
```bash
# Check disk usage
df -h /

# Check Docker usage
docker system df

# Check database size
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT pg_size_pretty(pg_database_size('baby_john_db'));"
```

**Solutions:**
```bash
# Clean up old containers and images
docker system prune -a --volumes

# Backup old data
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db | gzip > old_backup.sql.gz

# Delete old backups
rm old_backup_*.sql.gz

# Increase disk space (cloud provider)
```

---

## 🟡 Network Issues

### Container Can't Reach Database

**Problem:** API gets "connection refused" or "network unreachable"

**Check:**
```bash
# Verify network exists
docker network ls | grep baby_john

# Check network connectivity
docker-compose exec api ping postgres
docker-compose exec api python -c "import socket; socket.create_connection(('postgres', 5432))"

# Inspect network
docker network inspect baby_john_network
```

**Solutions:**
```bash
# Recreate network
docker-compose down
docker network rm baby_john_network
docker-compose up -d

# Check DNS resolution
docker-compose exec api nslookup postgres
```

### Ports Not Accessible from Host

**Problem:** Can't access http://localhost:8000

**Check:**
```bash
# Test from inside container
docker-compose exec api curl localhost:8000/api/health

# Check if port is open
netstat -tlnp | grep 8000  # macOS/Linux
netstat -ano | findstr 8000  # Windows
```

**Solutions:**
```bash
# Verify port mapping in docker-compose
cat docker-compose.yml | grep "ports:"

# Use correct host IP
# For Docker Desktop: http://localhost:8000
# For remote Docker: http://<docker-host-ip>:8000
```

---

## 🟢 Application Issues

### API Returns 500 Error

**Problem:** All API requests fail with 500 Internal Server Error

**Debug:**
```bash
# Check logs
docker-compose logs -f api

# Check if app started correctly
docker-compose exec api ps aux | grep uvicorn

# Test database connection
docker-compose exec api python -c "from database import engine; engine.connect()"

# Check environment variables
docker-compose exec api env | grep -E "DATABASE|SECRET"
```

**Common Causes:**

#### 1. Database Not Initialized
```bash
# Reinitialize
docker-compose exec api python init_db.py
```

#### 2. Missing Environment Variables
```bash
# Verify required vars
docker-compose exec api env | grep SECRET_KEY
docker-compose exec api env | grep DATABASE_URL

# Add to .env and restart
docker-compose down && docker-compose up -d
```

#### 3. Import/Module Errors
```bash
# Check Python path
docker-compose exec api python -c "import sys; print(sys.path)"

# Verify imports work
docker-compose exec api python -c "from main import app; print('OK')"

# Rebuild if dependencies changed
docker-compose build --no-cache
docker-compose up -d
```

### Slow API Response

**Problem:** API endpoints take too long to respond

**Analyze:**
```bash
# Check response time
time curl http://localhost:8000/api/health

# Check API logs
docker-compose logs api

# Monitor resources during request
docker stats

# Check database query time
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "EXPLAIN ANALYZE SELECT * FROM activities LIMIT 10;"
```

**Solutions:**
```bash
# Add database indexes
docker-compose exec api python -c "from models import Activity; Activity.__table__.indexes"

# Optimize queries
# Check for N+1 queries in logs

# Increase Gunicorn workers (production)
# Edit docker-compose.prod.yml:
# command: gunicorn main:app --workers 8 ...

# Restart
docker-compose restart api
```

### High Memory Usage

**Problem:** Container using too much memory

**Diagnose:**
```bash
# Check memory usage
docker stats baby_john_api

# Check what's using memory
docker-compose exec api ps aux --sort=-%mem

# Profile application
docker-compose exec api python -m memory_profiler app.py
```

**Solutions:**
```bash
# Restart container (temporary fix)
docker-compose restart api

# Reduce worker count (production)
command: gunicorn main:app --workers 2 ...

# Fix memory leak in code
# Check for unclosed connections
# Check for large data structures

# Monitor with limits
# docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 1G
```

---

## 🔵 Authentication & Security Issues

### JWT Token Errors

**Problem:** "Invalid token" or "Token expired"

**Check:**
```bash
# Verify SECRET_KEY is set
docker-compose exec api env | grep SECRET_KEY

# Check token expiration
docker-compose exec api python -c "
from auth import decode_token
token = 'your_token_here'
try:
    decode_token(token)
except Exception as e:
    print(f'Error: {e}')
"

# Generate new token
curl -X POST http://localhost:8000/api/auth/token \
  -d "username=papai@example.com&password=password123"
```

**Solutions:**
```bash
# Ensure SECRET_KEY hasn't changed
# If changed, old tokens are invalid (expected)

# Regenerate tokens with new key
curl -X POST http://localhost:8000/api/auth/token ...

# Check token expiration
docker-compose exec api env | grep ACCESS_TOKEN_EXPIRE_MINUTES
```

### Rate Limiting Too Strict

**Problem:** Getting "429 Too Many Requests" too quickly

**Check:**
```bash
# View rate limit headers
curl -i http://localhost:8000/api/activities
# Check X-RateLimit-* headers

# Check rate limiter config
grep "limiter.limit" backend/routers/activities.py
```

**Solutions:**
```bash
# Increase rate limits
# Edit .env:
RATE_LIMIT_REQUESTS=5000
RATE_LIMIT_PERIOD=60

# Restart
docker-compose down && docker-compose up -d

# Or modify endpoint limits in code
# @limiter.limit("1000/minute")
```

---

## 📊 Volume & Data Issues

### Lost Data After Restart

**Problem:** Data disappears when containers restart

**Check:**
```bash
# Verify volumes are mounted
docker-compose exec postgres df -h | grep /var/lib/postgresql

# List volumes
docker volume ls | grep baby_john

# Check volume mount point
docker inspect baby_john_postgres | grep -A 10 "Mounts"
```

**Solutions:**
```bash
# Ensure volumes are in docker-compose.yml
volumes:
  - postgres_data:/var/lib/postgresql/data

# Verify volume persistence
docker-compose down
docker volume ls  # Should still see postgres_data
docker-compose up -d
# Data should return
```

### Out of Disk Space

**Problem:** "No space left on device"

**Check:**
```bash
# Check disk usage
df -h

# Check Docker volume usage
docker volume ls
du -sh /var/lib/docker/volumes/*/

# Backup before cleanup
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db > backup_before_cleanup.sql
```

**Solutions:**
```bash
# Delete old containers
docker container prune

# Delete unused images
docker image prune -a

# Clean volumes (CAREFUL - deletes data!)
docker volume prune

# Move data to larger disk
```

---

## 🟣 Build Issues

### Build Fails

**Problem:** `docker-compose build` fails

**Debug:**
```bash
# Build with verbose output
docker-compose build --no-cache --verbose

# Build specific service
docker build -f backend/Dockerfile backend/ -v

# Check Dockerfile syntax
docker run --rm -i hadolint/hadolint < backend/Dockerfile
```

**Common Issues:**

#### 1. Dependency Installation Failed
```bash
# Check requirements.txt
cat backend/requirements.txt

# Test locally
pip install -r backend/requirements.txt

# Update requirements
pip freeze > backend/requirements.txt
```

#### 2. Network Access During Build
```bash
# Check internet connectivity
ping google.com

# Use proxy if needed
docker build --build-arg HTTP_PROXY=http://proxy:8080 ...
```

#### 3. File Not Found
```bash
# Verify file exists
ls -la backend/requirements.txt

# Check COPY/ADD paths in Dockerfile
cat backend/Dockerfile | grep COPY
```

---

## 🟤 Logging Issues

### No Logs Appearing

**Problem:** `docker-compose logs` returns nothing

**Check:**
```bash
# Check if logs are being written
docker-compose exec api tail -f /var/log/baby-john-api.log

# Check stdout/stderr
docker-compose logs --follow api

# Check container status
docker-compose ps
```

**Solutions:**
```bash
# Ensure logging is configured
docker-compose exec api env | grep LOG_LEVEL

# Restart logging
docker-compose restart api

# Redirect logs to file
docker-compose logs > logs.txt
```

### Logs Growing Too Large

**Problem:** Log files consuming all disk space

**Solutions:**
```bash
# Configure log rotation
# In docker-compose.yml:
logging:
  driver: json-file
  options:
    max-size: 10m
    max-file: 3

# Clean old logs manually
docker-compose logs --since 7d > archive.log
docker-compose logs --until 7d --follow api > /dev/null

# Use syslog driver
logging:
  driver: syslog
```

---

## 🆘 Emergency Recovery

### Complete Data Loss

**If all data is gone:**

1. Check for backups
```bash
ls -la backup*.sql*
```

2. Restore from backup
```bash
docker-compose exec -T postgres psql -U baby_john_user baby_john_db < backup.sql
```

3. If no backup exists
```bash
# Reinitialize database
docker-compose down -v
docker-compose up -d
docker-compose exec api python init_db.py
```

### Container Completely Broken

```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
docker-compose exec api python init_db.py
```

---

## 📞 Getting Help

### Information to Provide

When asking for help, include:
```bash
# Docker version
docker --version

# Docker Compose version
docker-compose --version

# Full error message
docker-compose logs api

# Environment info
docker-compose config

# Container status
docker-compose ps

# System info
uname -a
df -h
free -h
```

### Useful Commands for Support

```bash
# Save diagnostics to file
docker-compose logs > diagnostics.log
docker ps >> diagnostics.log
docker stats --no-stream >> diagnostics.log
env | grep -E "DOCKER|DB_" >> diagnostics.log
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-09-09
