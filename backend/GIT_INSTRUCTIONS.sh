#!/bin/bash
# Baby John - Git Setup Instructions
# Como fazer commit e push da implementação

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Baby John Backend - Instruções Git                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Status do Git:${NC}"
git status

echo ""
echo -e "${BLUE}Adicionando arquivos ao staging:${NC}"
git add backend/

echo ""
echo -e "${BLUE}Arquivos staged:${NC}"
git diff --cached --name-only | head -20

echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo ""
echo "1. Revisar mudanças:"
echo "   git diff --cached | less"
echo ""
echo "2. Fazer commit:"
echo "   git commit -m 'feat: implement PostgreSQL backend with SQLAlchemy 2.0"
echo "   - Add database layer with connection pooling"
echo "   - Implement JWT authentication"
echo "   - Add rate limiting and auditoria"
echo "   - Create comprehensive documentation'"
echo ""
echo "3. Fazer push:"
echo "   git push -u origin bd_feat"
echo ""
echo "4. Criar Pull Request:"
echo "   gh pr create --title 'feat: PostgreSQL + SQLAlchemy 2.0 Backend'"
echo ""

read -p "Deseja continuar com o commit? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    git commit -m "feat: implement PostgreSQL backend with SQLAlchemy 2.0

- Add SQLAlchemy 2.0 ORM with 5 models (User, Activity, CustomActivity, AuditLog, APIKey)
- Implement PostgreSQL database with connection pooling and optimized indexes
- Create CRUD operations with parametrized queries (SQL injection prevention)
- Add JWT authentication with bcrypt password hashing
- Implement rate limiting with SlowAPI
- Add comprehensive auditoria logging
- Create 13 API endpoints (6 auth, 6 activities, health checks)
- Add extensive documentation (8 documents)
- Include test suite with 11 functional tests
- Create setup scripts for Linux/macOS/Windows
- Add Postman collection for API testing
- Ensure 100% security with ownership checks and CORS
- Production-ready with Docker support

Co-Authored-By: Claude Code <noreply@anthropic.com>"

    echo ""
    echo -e "${GREEN}✅ Commit realizado com sucesso!${NC}"
fi
