#!/bin/bash
# Docker Compose Management Script
# Manage development and production environments

set -e

DOCKER_COMPOSE_DEV="docker-compose.yml"
DOCKER_COMPOSE_PROD="docker-compose.prod.yml"
ENV_FILE=".env.docker"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function print_usage() {
    echo "Usage: ./docker-compose-manager.sh [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  up          Start containers"
    echo "  down        Stop containers"
    echo "  restart     Restart containers"
    echo "  logs        Show container logs"
    echo "  ps          List running containers"
    echo "  build       Build images"
    echo "  clean       Remove containers and volumes"
    echo "  init-db     Initialize database"
    echo "  backup      Backup database"
    echo "  restore     Restore database backup"
    echo ""
    echo "Environments:"
    echo "  dev         Development (default)"
    echo "  prod        Production"
    echo ""
    echo "Examples:"
    echo "  ./docker-compose-manager.sh up dev"
    echo "  ./docker-compose-manager.sh logs prod"
    echo "  ./docker-compose-manager.sh down prod"
}

function get_compose_file() {
    if [ "$1" == "prod" ]; then
        echo "$DOCKER_COMPOSE_PROD"
    else
        echo "$DOCKER_COMPOSE_DEV"
    fi
}

# Get command and environment
COMMAND=${1:-up}
ENVIRONMENT=${2:-dev}
COMPOSE_FILE=$(get_compose_file "$ENVIRONMENT")

echo -e "${BLUE}Baby John Docker Manager${NC}"
echo "Command: $COMMAND | Environment: $ENVIRONMENT"
echo ""

case $COMMAND in
    up)
        echo -e "${GREEN}Starting containers...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
        echo -e "${GREEN}✓ Containers started${NC}"
        if [ "$ENVIRONMENT" == "dev" ]; then
            echo -e "${GREEN}API available at: http://localhost:8000${NC}"
            echo -e "${GREEN}Docs at: http://localhost:8000/docs${NC}"
            echo -e "${GREEN}pgAdmin at: http://localhost:5050${NC}"
        fi
        ;;

    down)
        echo -e "${BLUE}Stopping containers...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
        echo -e "${GREEN}✓ Containers stopped${NC}"
        ;;

    restart)
        echo -e "${BLUE}Restarting containers...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
        echo -e "${GREEN}✓ Containers restarted${NC}"
        ;;

    logs)
        echo -e "${BLUE}Showing logs...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
        ;;

    ps)
        echo -e "${BLUE}Running containers:${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
        ;;

    build)
        echo -e "${BLUE}Building images...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
        echo -e "${GREEN}✓ Images built${NC}"
        ;;

    clean)
        echo -e "${RED}Warning: This will remove containers and volumes${NC}"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v
            echo -e "${GREEN}✓ Cleanup complete${NC}"
        fi
        ;;

    init-db)
        echo -e "${BLUE}Initializing database...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec api python init_db.py
        echo -e "${GREEN}✓ Database initialized${NC}"
        ;;

    backup)
        echo -e "${BLUE}Backing up database...${NC}"
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_dump \
            -U baby_john_user baby_john_db > "$BACKUP_FILE"
        echo -e "${GREEN}✓ Backup saved to: $BACKUP_FILE${NC}"
        ;;

    restore)
        if [ -z "$3" ]; then
            echo -e "${RED}Error: Please specify backup file${NC}"
            echo "Usage: ./docker-compose-manager.sh restore $ENVIRONMENT backup_file.sql"
            exit 1
        fi
        echo -e "${BLUE}Restoring database from $3...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql \
            -U baby_john_user baby_john_db < "$3"
        echo -e "${GREEN}✓ Database restored${NC}"
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        print_usage
        exit 1
        ;;
esac
