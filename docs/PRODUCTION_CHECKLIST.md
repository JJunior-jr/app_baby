# Production Deployment Checklist

Complete checklist for deploying Baby John backend to production.

## 📋 Pre-Deployment Checklist

### 🔐 Security Setup
- [ ] **Generate SECRET_KEY**
  ```bash
  bash generate-secret.sh > secret.txt
  cat secret.txt  # Copy value
  ```
- [ ] **Set strong database password** (minimum 16 characters)
- [ ] **Change all default passwords** in .env.prod
  - [ ] PGADMIN_PASSWORD
  - [ ] DB_PASSWORD
- [ ] **Enable SSL/TLS certificates**
  - [ ] Obtain certificates (Let's Encrypt, AWS Certificate Manager, etc.)
  - [ ] Place in `ssl/` directory
  - [ ] Update nginx.conf with certificate paths
- [ ] **Validate environment variables**
  ```bash
  bash validate-env.sh prod
  ```

### 🗄️ Database Preparation
- [ ] **Backup existing database** (if migrating)
  ```bash
  pg_dump -U production_user existing_db > backup.sql
  ```
- [ ] **Create database user with restricted permissions**
  ```sql
  CREATE USER baby_john_user WITH PASSWORD 'secure_password';
  GRANT CONNECT ON DATABASE baby_john_db TO baby_john_user;
  ```
- [ ] **Initialize schema**
  ```bash
  docker-compose -f docker-compose.prod.yml exec api python init_db.py
  ```
- [ ] **Create backups strategy**
  - [ ] Daily automated backups (configure cron)
  - [ ] Off-site storage (S3, backup service)
  - [ ] Test restore procedure

### 🛠️ Infrastructure Setup
- [ ] **Select hosting provider**
  - [ ] AWS EC2 / ECS
  - [ ] DigitalOcean
  - [ ] Azure Container Instances
  - [ ] Self-hosted (VPS)
- [ ] **Provision server**
  - [ ] 2+ vCPU
  - [ ] 4GB+ RAM
  - [ ] 20GB+ storage
  - [ ] Ubuntu 20.04+ or similar
- [ ] **Install Docker and Docker Compose**
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  ```
- [ ] **Configure firewall**
  - [ ] Allow port 22 (SSH)
  - [ ] Allow port 80 (HTTP)
  - [ ] Allow port 443 (HTTPS)
  - [ ] Block all other inbound traffic
- [ ] **Setup DNS**
  - [ ] Point domain to server IP
  - [ ] Wait for DNS propagation
  - [ ] Test DNS resolution

### 📝 Application Setup
- [ ] **Copy files to server**
  ```bash
  scp -r .env.prod user@server:/home/user/app_baby/
  scp -r docker-compose.prod.yml user@server:/home/user/app_baby/
  scp -r nginx.conf user@server:/home/user/app_baby/
  scp -r backend/ user@server:/home/user/app_baby/
  ```
- [ ] **Copy SSL certificates**
  ```bash
  mkdir -p ssl/
  scp cert.pem user@server:/home/user/app_baby/ssl/
  scp key.pem user@server:/home/user/app_baby/ssl/
  ```
- [ ] **Set permissions**
  ```bash
  chmod 600 .env.prod
  chmod 600 ssl/key.pem
  chmod 644 ssl/cert.pem
  ```

### 🚀 Deployment
- [ ] **Build and test locally first**
  ```bash
  docker-compose -f docker-compose.prod.yml build
  ```
- [ ] **Push image to registry** (optional, for faster deployment)
  ```bash
  docker tag baby_john_api:latest registry.example.com/baby_john_api:1.0.0
  docker push registry.example.com/baby_john_api:1.0.0
  ```
- [ ] **Deploy to production**
  ```bash
  docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
  ```
- [ ] **Run health checks**
  ```bash
  curl https://yourdomain.com/api/health
  docker-compose -f docker-compose.prod.yml ps
  docker-compose -f docker-compose.prod.yml logs
  ```
- [ ] **Initialize database**
  ```bash
  docker-compose -f docker-compose.prod.yml exec api python init_db.py
  ```

---

## ✅ Post-Deployment Verification

### 🔍 Functionality Tests
- [ ] **Health endpoint responds**
  ```bash
  curl https://yourdomain.com/api/health
  # Expected: {"status": "healthy", ...}
  ```
- [ ] **API documentation accessible**
  - [ ] https://yourdomain.com/docs
  - [ ] https://yourdomain.com/redoc
- [ ] **Authentication works**
  ```bash
  curl -X POST "https://yourdomain.com/api/auth/token" \
    -d "username=papai@example.com&password=password123"
  ```
- [ ] **Activities CRUD operations**
  - [ ] Create activity
  - [ ] List activities
  - [ ] Get activity
  - [ ] Update activity
  - [ ] Delete activity
- [ ] **Database connectivity**
  ```bash
  docker-compose -f docker-compose.prod.yml exec postgres psql -U baby_john_user -d baby_john_db -c "SELECT 1"
  ```
- [ ] **Rate limiting active**
  - [ ] Make 1000+ requests rapidly
  - [ ] Verify rate limit response (429)

### 🔐 Security Tests
- [ ] **SSL/TLS certificate**
  - [ ] Valid certificate
  - [ ] No warnings in browser
  - [ ] Correct domain
- [ ] **HTTPS redirect**
  - [ ] HTTP requests redirect to HTTPS
  - [ ] Test: `curl -i http://yourdomain.com`
- [ ] **CORS headers correct**
  - [ ] Only allowed origins
  - [ ] No wildcard in production
- [ ] **SQL injection protection**
  - [ ] Parameterized queries used
  - [ ] Malicious input handled safely
- [ ] **JWT validation**
  - [ ] Invalid tokens rejected
  - [ ] Expired tokens rejected
  - [ ] Missing authorization fails
- [ ] **Secrets not exposed**
  - [ ] No credentials in logs
  - [ ] Environment variables protected
  - [ ] .env.prod not in repo

### 📊 Performance Tests
- [ ] **API response time**
  - [ ] Health check < 100ms
  - [ ] List activities < 500ms
  - [ ] Create activity < 1000ms
- [ ] **Database performance**
  - [ ] Queries optimized
  - [ ] Indexes present
  - [ ] No N+1 queries
- [ ] **Container resources**
  - [ ] CPU usage < 50% idle
  - [ ] Memory usage reasonable
  - [ ] Disk space adequate
- [ ] **Load test**
  ```bash
  ab -n 1000 -c 10 https://yourdomain.com/api/health
  ```

### 📈 Monitoring Setup
- [ ] **Container logs configured**
  - [ ] Logs written to file
  - [ ] Log rotation enabled
  - [ ] Log level appropriate
- [ ] **Health checks enabled**
  - [ ] All services have health checks
  - [ ] Unhealthy containers restart
- [ ] **Monitoring system enabled** (optional)
  - [ ] Prometheus metrics
  - [ ] Grafana dashboards
  - [ ] Alert rules configured
- [ ] **Error tracking** (optional)
  - [ ] Sentry configured
  - [ ] Error notifications enabled

---

## 🔧 Ongoing Operations

### 📅 Daily Tasks
- [ ] **Check logs**
  ```bash
  docker-compose -f docker-compose.prod.yml logs --tail 100
  ```
- [ ] **Verify health**
  ```bash
  curl https://yourdomain.com/api/health
  ```
- [ ] **Monitor resources**
  ```bash
  docker stats
  ```

### 📆 Weekly Tasks
- [ ] **Backup database**
  ```bash
  docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U baby_john_user baby_john_db | gzip > backup_$(date +%Y%m%d).sql.gz
  ```
- [ ] **Review error logs**
- [ ] **Update dependencies** (security patches)
- [ ] **Test disaster recovery**

### 📆 Monthly Tasks
- [ ] **Security updates**
  - [ ] Update Docker images
  - [ ] Update Python dependencies
  - [ ] Review security advisories
- [ ] **Performance review**
  - [ ] Analyze slow queries
  - [ ] Review resource usage
  - [ ] Check for bottlenecks
- [ ] **Backup rotation**
  - [ ] Archive old backups
  - [ ] Test restore from archive
- [ ] **SSL certificate renewal** (if not auto-renewed)

### 📆 Quarterly Tasks
- [ ] **Security audit**
  - [ ] Review access logs
  - [ ] Check for suspicious activity
  - [ ] Audit user permissions
- [ ] **Capacity planning**
  - [ ] Review growth trends
  - [ ] Plan for scaling
  - [ ] Check storage usage
- [ ] **Disaster recovery test**
  - [ ] Test full restore
  - [ ] Document recovery time
  - [ ] Update procedures

---

## 🆘 Rollback Procedure

If deployment fails or needs to be rolled back:

### Quick Rollback
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml --env-file .env.prod down

# Restore previous version (if using image registry)
docker pull registry.example.com/baby_john_api:previous-version

# Start with previous version
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Database Rollback
```bash
# If database was updated and needs rollback:
docker-compose -f docker-compose.prod.yml exec postgres psql -U baby_john_user -d baby_john_db < backup.sql
```

### Full Rollback Steps
1. Stop current containers: `docker-compose down`
2. Restore database from backup
3. Restore application files
4. Pull previous Docker image
5. Start containers with previous version
6. Verify functionality
7. Document what went wrong
8. Plan fix and retry

---

## 📊 Status Dashboard

Create a monitoring dashboard to track:
- [ ] Container status
- [ ] Database connections
- [ ] API response times
- [ ] Error rates
- [ ] Resource utilization
- [ ] Backup status
- [ ] SSL certificate expiration

Suggested tools:
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **AlertManager** - Alerts
- **Node Exporter** - System metrics

---

## 📝 Documentation Before Going Live

- [ ] Create runbook for common issues
- [ ] Document deployment procedure
- [ ] Record SSH keys securely
- [ ] Document database credentials (secure vault)
- [ ] Create incident response plan
- [ ] Document rollback procedures
- [ ] Maintain architecture diagrams
- [ ] Record configuration changes

---

## ✨ Production Best Practices

### Security
- ✅ Use strong, unique passwords
- ✅ Enable SSL/TLS
- ✅ Restrict firewall access
- ✅ Regular security updates
- ✅ Monitor access logs
- ✅ Secure backups
- ✅ Use HTTPS only
- ✅ Enable rate limiting

### Reliability
- ✅ Health checks on all services
- ✅ Auto-restart on failure
- ✅ Regular backups (automated)
- ✅ Test restore procedures
- ✅ Monitor error rates
- ✅ Setup alerts
- ✅ Document runbooks
- ✅ Maintain changelog

### Performance
- ✅ Monitor response times
- ✅ Optimize database queries
- ✅ Use connection pooling
- ✅ Cache when appropriate
- ✅ Monitor resource usage
- ✅ Plan for growth
- ✅ Load test before peak
- ✅ Profile bottlenecks

### Operations
- ✅ Keep logs organized
- ✅ Rotate logs regularly
- ✅ Document procedures
- ✅ Train team members
- ✅ Review incidents
- ✅ Plan maintenance windows
- ✅ Test disaster recovery
- ✅ Maintain inventory

---

## 🎯 Success Criteria

Deployment is successful when:
1. ✅ All health checks pass
2. ✅ API responds to requests
3. ✅ Database stores/retrieves data correctly
4. ✅ SSL/TLS working
5. ✅ Rate limiting active
6. ✅ Logs being written
7. ✅ Backups created
8. ✅ Monitoring operational
9. ✅ Team trained
10. ✅ Runbooks documented

---

## 📞 Support & Escalation

### Level 1 - Quick Fixes
- Container won't start → Check logs, restart
- Port conflict → Change port, restart
- Database full → Cleanup old data

### Level 2 - Investigation
- Slow queries → Analyze logs, optimize
- Memory leak → Profile application
- Connection issues → Check network

### Level 3 - Expert Help
- Contact infrastructure team
- Escalate to maintainers
- Engage external support

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  
**Notes:** _______________

---

**Version:** 1.0.0  
**Last Updated:** 2026-09-09
