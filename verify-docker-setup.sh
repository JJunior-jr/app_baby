#!/usr/bin/env bash
# Docker Verification Script
# Checks if all Docker files are properly configured

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Docker Setup Verification${NC}"
echo -e "${BLUE}================================${NC}\n"

ERRORS=0
WARNINGS=0

# Check Docker installation
echo -e "${BLUE}1. Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker installed: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker not found${NC}"
    ((ERRORS++))
fi

# Check Docker Compose
echo -e "\n${BLUE}2. Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ Docker Compose installed: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    ((ERRORS++))
fi

# Check required files
echo -e "\n${BLUE}3. Checking required Docker files...${NC}"
REQUIRED_FILES=(
    "Dockerfile"
    "docker-compose.yml"
    "docker-compose.prod.yml"
    "nginx.conf"
    ".dockerignore"
    ".env.docker"
    "DOCKER_SETUP.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    # Check in backend subdirectory for Dockerfile
    if [ "$file" == "Dockerfile" ]; then
        if [ -f "backend/$file" ]; then
            echo -e "${GREEN}✓ $file (backend/)${NC}"
        else
            echo -e "${RED}✗ $file (backend/) not found${NC}"
            ((ERRORS++))
        fi
    else
        if [ -f "$file" ]; then
            echo -e "${GREEN}✓ $file${NC}"
        else
            echo -e "${RED}✗ $file not found${NC}"
            ((ERRORS++))
        fi
    fi
done

# Check environment file
echo -e "\n${BLUE}4. Checking environment configuration...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓ DATABASE_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠ DATABASE_URL not set in .env${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ .env file not found (using .env.docker as template)${NC}"
    ((WARNINGS++))
fi

# Check backend files
echo -e "\n${BLUE}5. Checking backend structure...${NC}"
BACKEND_FILES=(
    "backend/main.py"
    "backend/requirements.txt"
    "backend/database.py"
    "backend/models.py"
    "backend/crud.py"
    "backend/auth.py"
    "backend/routers/activities.py"
    "backend/routers/auth.py"
    "backend/schemas.py"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file not found${NC}"
        ((ERRORS++))
    fi
done

# Check Docker daemon
echo -e "\n${BLUE}6. Checking Docker daemon...${NC}"
if docker ps > /dev/null 2>&1; then
    CONTAINERS=$(docker ps -q | wc -l)
    echo -e "${GREEN}✓ Docker daemon is running ($CONTAINERS containers)${NC}"
else
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    ((ERRORS++))
fi

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All checks passed!${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Copy environment: cp .env.docker .env"
    echo "2. Edit .env with your configuration"
    echo "3. Start containers: docker-compose up -d"
    echo "4. Initialize database: docker-compose exec api python init_db.py"
    echo "5. Access API: http://localhost:8000/docs"
    exit 0
else
    echo -e "\n${RED}✗ Setup incomplete - please fix errors above${NC}"
    exit 1
fi
