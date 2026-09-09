# Docker Quick Start Guide

## 🚀 5-Minute Quick Start

### Prerequisites
```bash
# Check Docker installation
docker --version
docker-compose --version
```

### Setup
```bash
# 1. Navigate to project
cd app_baby

# 2. Copy environment file
cp .env.docker .env

# 3. Start services
docker-compose up -d

# 4. Initialize database
docker-compose exec api python init_db.py

# 5. Verify
curl http://localhost:8000/api/health
```

### Access Services
```
API:      http://localhost:8000
Docs:     http://localhost:8000/docs
pgAdmin:  http://localhost:5050
```

---

## 📁 Docker Files Structure

```
app_baby/
├── Dockerfile                    # Production Python image (in backend/)
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── nginx.conf                   # Reverse proxy config
├── .dockerignore               # Files excluded from build
├── .env.docker                 # Environment template
├── .env.prod.example           # Production env template
├── verify-docker-setup.sh      # Verification script
├── docker-compose-manager.sh   # Management script
├── DOCKER_SETUP.md             # Full setup guide
├── DOCKER_QUICKSTART.md        # This file
└── backend/
    ├── Dockerfile
    ├── main.py
    ├── requirements.txt
    ├── database.py
    └── ... (other Python files)
```

---

## 🐳 Common Commands

### Development
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

### Database
```bash
# Initialize
docker-compose exec api python init_db.py

# Backup
docker-compose exec postgres pg_dump -U baby_john_user baby_john_db > backup.sql

# Connect to database
docker-compose exec postgres psql -U baby_john_user -d baby_john_db
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# View production logs
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f api

# Stop production
docker-compose -f docker-compose.prod.yml --env-file .env.prod down
```

---

## ✅ Verification

### Automated Check
```bash
# Run verification script
bash verify-docker-setup.sh
```

### Manual Verification
```bash
# Check Docker daemon
docker ps

# Check running containers
docker-compose ps

# Check API health
curl http://localhost:8000/api/health

# Check logs
docker-compose logs api
```

---

## 🔧 Troubleshooting

### Container Won't Start
```bash
docker-compose logs api
# Common issues:
# - Database not ready
# - PORT already in use
# - Missing .env file
```

### Database Connection Failed
```bash
# Check if postgres is running
docker-compose ps postgres

# Check database credentials in .env
cat .env | grep DATABASE

# Test connection
docker-compose exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"
```

### Port Already in Use
```bash
# Change port in .env
API_PORT=8001

# Restart
docker-compose down
docker-compose up -d
```

### Permission Denied on .sh Files
```bash
# Make executable
chmod +x verify-docker-setup.sh
chmod +x docker-compose-manager.sh

# Run
bash verify-docker-setup.sh
```

---

## 📚 Documentation

- **Full Setup Guide:** DOCKER_SETUP.md
- **Deployment Guide:** backend/DEPLOYMENT.md
- **API Documentation:** backend/API_CLIENT.md
- **Architecture:** backend/README.md

---

## 🎯 Next Steps

1. ✅ Copy `.env.docker` to `.env`
2. ✅ Run `docker-compose up -d`
3. ✅ Initialize database: `docker-compose exec api python init_db.py`
4. ✅ Access API: http://localhost:8000/docs
5. ✅ Review DOCKER_SETUP.md for advanced configuration
6. ✅ Deploy to production when ready

---

**Need Help?**
- Check logs: `docker-compose logs -f`
- Read DOCKER_SETUP.md for comprehensive guide
- Review DEPLOYMENT.md for production setup
- See backend/API_CLIENT.md for API examples

---

**Version:** 1.0.0  
**Last Updated:** 2026-09-09
