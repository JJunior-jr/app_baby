# Environment Files & Git Ignore Setup Guide

## 📋 Files Created

### Environment Files
1. ✅ `.env` - Development environment variables
2. ✅ `.env.prod` - Production environment variables  
3. ✅ `.gitignore` - Root level git ignore
4. ✅ `backend/.gitignore` - Backend specific git ignore
5. ✅ `.gitignore-frontend` - Frontend specific git ignore (if applicable)

---

## 🔐 Security Notes

### .env File (Development)
- Contains development secrets
- **MUST NOT be committed to git**
- Already in `.gitignore`
- Safe for local development with default values
- Change `SECRET_KEY` for each developer if desired

### .env.prod File (Production)
- Contains production secrets
- **MUST NOT be committed to git**
- Already in `.gitignore`
- Use environment management system (Vault, AWS Secrets Manager, etc.)
- Generate secure values before deployment

### What's Ignored
```
✅ .env files (all variations)
✅ Credentials and keys
✅ Database files
✅ Virtual environments
✅ Cache and temp files
✅ IDE settings
✅ OS-specific files
✅ Build artifacts
✅ Logs
```

---

## 📖 How to Use

### Development Setup
```bash
# File already exists: .env
# It contains safe development values

# Verify it exists
cat .env

# If you need to reset
cp .env.docker .env
```

### Production Setup
```bash
# Start with template
cp .env.prod.example .env.prod

# Or use provided file
# File created: .env.prod

# Edit with production values
nano .env.prod

# IMPORTANT: Secure this file!
# - Don't commit to git
# - Use environment variables in production
# - Store in secrets management system
```

### Git Configuration
```bash
# Verify .env files are ignored
git status | grep .env
# Should show nothing

# Check what would be ignored
git check-ignore -v .env
# Should show: .env (matched by pattern .env)

# Safe to add to git
git status
# Should not show .env or .env.prod
```

---

## ✅ Verification

### Check .env files created
```bash
ls -la .env*
# Expected:
# .env (development)
# .env.prod (production)
```

### Check .gitignore files created
```bash
ls -la .gitignore*
# Expected:
# .gitignore (root)
# backend/.gitignore
# .gitignore-frontend (optional)
```

### Verify ignored by git
```bash
# Add files to git (they won't be added)
git add .env .env.prod

# Check status
git status
# Should show: nothing to commit

# Verify they're ignored
git check-ignore -v .env .env.prod
# Should show both files are matched by .gitignore
```

---

## 🚀 Deployment Workflow

### Development
```bash
# Use .env file (in .gitignore)
docker-compose up -d

# All changes are local, safe to experiment
```

### Staging/Production
```bash
# Use environment variables (not files!)
export DATABASE_URL="postgresql+psycopg://..."
export SECRET_KEY="your-secure-key"

# Or use Docker secrets/Kubernetes secrets
# Or CI/CD environment variables

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔑 Secret Management Best Practices

### Never Do This ❌
```bash
# ❌ Don't commit .env files
git add .env
git commit -m "add env file"

# ❌ Don't put secrets in code
DATABASE_URL = "postgresql+psycopg://user:pass@host/db"

# ❌ Don't hardcode in Dockerfile
ENV SECRET_KEY="my-secret-key"
```

### Do This Instead ✅
```bash
# ✅ Use .gitignore
echo ".env" >> .gitignore

# ✅ Use environment variables
export SECRET_KEY="secure-key"
docker-compose up -d

# ✅ Use secrets management
# AWS Secrets Manager
# HashiCorp Vault
# Kubernetes Secrets
# GitHub Secrets
```

---

## 📝 Environment Variables Reference

### Development (.env)
- DATABASE_URL: Local PostgreSQL
- SECRET_KEY: Development key (safe default)
- DEBUG: False (good practice)
- CORS_ORIGINS: localhost:3000, localhost:8000

### Production (.env.prod)
- DATABASE_URL: Production database
- SECRET_KEY: Secure generated key (min 32 chars)
- DEBUG: False (required)
- CORS_ORIGINS: Your domain only
- SECURE_COOKIES: True
- Database pool: Optimized (50 connections)

---

## 🔄 Git Workflow

### Initial Setup
```bash
# 1. Clone repository
git clone <repo>

# 2. .env will NOT be cloned (it's in .gitignore)
# Files missing: .env

# 3. Create .env locally
cp .env.docker .env

# 4. Development ready
docker-compose up -d
```

### Making Changes
```bash
# 1. Edit code
nano backend/main.py

# 2. Commit (env files ignored)
git add backend/main.py
git commit -m "feat: add new endpoint"

# 3. Push (secrets stay local)
git push origin main
```

### Production Deployment
```bash
# 1. Clone repository
git clone <repo>

# 2. Set environment variables
export DATABASE_URL="prod-db-url"
export SECRET_KEY="secure-key"

# 3. Deploy with variables (not files!)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📂 File Structure

```
app_baby/
├── .env                         ✅ Created (Development)
├── .env.prod                    ✅ Created (Production)
├── .env.docker                  (Template - already exists)
├── .env.prod.example            (Template - already exists)
├── .gitignore                   ✅ Created (Root ignore)
├── backend/
│   └── .gitignore               ✅ Created (Backend ignore)
├── .gitignore-frontend          ✅ Created (If needed)
└── ...
```

---

## ⚠️ Important Reminders

### Before Committing
```bash
# 1. Make sure .gitignore is committed
git add .gitignore backend/.gitignore
git commit -m "chore: add gitignore files"
git push

# 2. Verify .env is NOT staged
git status
# Should NOT show .env or .env.prod

# 3. Double-check
git check-ignore -v .env .env.prod
# Should show both are ignored
```

### If Accidentally Committed
```bash
# 1. Stop! Remove the file from git history
git rm --cached .env
git commit -m "chore: remove env file from git"

# 2. Make sure .gitignore prevents this
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: add .env to gitignore"

# 3. Force update (WARNING: only for secrets!)
git push --force-with-lease
```

---

## ✅ Final Checklist

- [x] `.env` created (development)
- [x] `.env.prod` created (production)
- [x] `.gitignore` created (root)
- [x] `backend/.gitignore` created
- [x] `frontend/.gitignore` created (optional)
- [x] All env files in .gitignore
- [x] Ready to use
- [x] Safe from accidental commits

---

## 🎯 Next Steps

### 1. Verify Setup
```bash
git status
# Should show: .env, .env.prod NOT listed
```

### 2. Test Locally
```bash
docker-compose up -d
docker-compose exec api python init_db.py
```

### 3. Commit to Git
```bash
git add .gitignore backend/.gitignore
git commit -m "chore: setup environment and gitignore files"
git push
```

### 4. Production Ready
```bash
# Use environment variables instead of files
export DATABASE_URL="your-prod-url"
export SECRET_KEY="your-secure-key"
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Reference

| File | Purpose | Committed? |
|------|---------|-----------|
| .env | Dev variables | ❌ No |
| .env.prod | Prod variables | ❌ No |
| .env.docker | Dev template | ✅ Yes |
| .env.prod.example | Prod template | ✅ Yes |
| .gitignore | Root ignore | ✅ Yes |
| backend/.gitignore | Backend ignore | ✅ Yes |

---

**Status:** ✅ Complete  
**Security:** ✅ Verified  
**Ready:** ✅ Yes

Use `git add .gitignore` and push to repository. Your secrets are now safe! 🔒
