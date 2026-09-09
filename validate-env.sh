#!/usr/bin/env bash
# Validate environment variables before Docker startup
# Usage: bash validate-env.sh [environment]

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-dev}
ENV_FILE=".env"

if [ "$ENVIRONMENT" == "prod" ]; then
    ENV_FILE=".env.prod"
fi

echo -e "${BLUE}Environment Validation - $ENVIRONMENT${NC}"
echo -e "${BLUE}File: $ENV_FILE${NC}\n"

ERRORS=0

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ $ENV_FILE not found${NC}"
    echo -e "${YELLOW}  Create with: cp .env.docker .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ $ENV_FILE exists${NC}\n"

# Required variables for both environments
REQUIRED_VARS=(
    "DATABASE_URL"
    "SECRET_KEY"
    "ALGORITHM"
    "DEBUG"
    "LOG_LEVEL"
)

# Additional required for production
if [ "$ENVIRONMENT" == "prod" ]; then
    REQUIRED_VARS+=(
        "SECURE_COOKIES"
        "SSL_VERIFY"
    )
fi

echo -e "${BLUE}Checking required variables...${NC}"
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" "$ENV_FILE"; then
        VALUE=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2-)

        # Check for placeholder values in production
        if [ "$ENVIRONMENT" == "prod" ]; then
            if echo "$VALUE" | grep -q "CHANGE_THIS"; then
                echo -e "${RED}✗ $var has placeholder value (CHANGE_THIS)${NC}"
                ((ERRORS++))
            elif echo "$VALUE" | grep -q "your-secret-key"; then
                echo -e "${RED}✗ $var has insecure default value${NC}"
                ((ERRORS++))
            elif [ -z "$VALUE" ]; then
                echo -e "${RED}✗ $var is empty${NC}"
                ((ERRORS++))
            else
                echo -e "${GREEN}✓ $var configured${NC}"
            fi
        else
            if [ -z "$VALUE" ]; then
                echo -e "${YELLOW}⚠ $var is empty${NC}"
            else
                echo -e "${GREEN}✓ $var configured${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ $var not found${NC}"
        ((ERRORS++))
    fi
done

# Validate specific values
echo -e "\n${BLUE}Validating values...${NC}"

# Check DATABASE_URL format
DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
if [[ $DB_URL == postgresql* ]] || [[ $DB_URL == postgresql+* ]]; then
    echo -e "${GREEN}✓ DATABASE_URL format valid${NC}"
else
    echo -e "${RED}✗ DATABASE_URL format invalid${NC}"
    echo -e "${YELLOW}  Expected: postgresql+psycopg://user:pass@host:port/db${NC}"
    ((ERRORS++))
fi

# Check SECRET_KEY length (should be at least 32 chars)
SECRET_KEY=$(grep "^SECRET_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
if [ ${#SECRET_KEY} -ge 32 ]; then
    echo -e "${GREEN}✓ SECRET_KEY length sufficient (${#SECRET_KEY} chars)${NC}"
elif [ "$ENVIRONMENT" == "dev" ]; then
    echo -e "${YELLOW}⚠ SECRET_KEY should be at least 32 chars (${#SECRET_KEY} chars)${NC}"
else
    echo -e "${RED}✗ SECRET_KEY too short (${#SECRET_KEY} chars, need 32+)${NC}"
    ((ERRORS++))
fi

# Check DEBUG value
DEBUG=$(grep "^DEBUG=" "$ENV_FILE" | cut -d'=' -f2-)
if [ "$DEBUG" == "False" ] || [ "$DEBUG" == "false" ]; then
    echo -e "${GREEN}✓ DEBUG disabled${NC}"
elif [ "$ENVIRONMENT" == "prod" ]; then
    echo -e "${RED}✗ DEBUG should be False in production${NC}"
    ((ERRORS++))
else
    echo -e "${YELLOW}⚠ DEBUG enabled in development${NC}"
fi

# Check LOG_LEVEL
LOG_LEVEL=$(grep "^LOG_LEVEL=" "$ENV_FILE" | cut -d'=' -f2-)
if [[ $LOG_LEVEL =~ ^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$ ]]; then
    echo -e "${GREEN}✓ LOG_LEVEL valid: $LOG_LEVEL${NC}"
else
    echo -e "${RED}✗ LOG_LEVEL invalid: $LOG_LEVEL${NC}"
    echo -e "${YELLOW}  Valid values: DEBUG, INFO, WARNING, ERROR, CRITICAL${NC}"
    ((ERRORS++))
fi

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}================================${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All validations passed!${NC}"
    echo -e "\n${BLUE}Environment is ready. Start with:${NC}"
    if [ "$ENVIRONMENT" == "prod" ]; then
        echo "docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE up -d"
    else
        echo "docker-compose up -d"
    fi
    exit 0
else
    echo -e "${RED}✗ $ERRORS validation error(s) found${NC}"
    echo -e "\n${YELLOW}Please fix the issues above and try again${NC}"
    exit 1
fi
