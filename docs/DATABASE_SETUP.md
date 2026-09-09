"""
Documentação de Setup e Configuração do Banco PostgreSQL
Baby John - Diário do Bebê
"""

# ============================================================================
# 1. INSTALAÇÃO DE DEPENDÊNCIAS
# ============================================================================

# Instalar pacotes Python
pip install -r requirements.txt

# ============================================================================
# 2. CONFIGURAÇÃO DO PostgreSQL
# ============================================================================

# Windows (usando WSL2 ou PostgreSQL instalado):
# 1. Baixar PostgreSQL 14+ de https://www.postgresql.org/download/
# 2. Durante instalação, set password para postgres user
# 3. Anotar porta (default 5432)

# Linux:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql

# ============================================================================
# 3. CRIAR BANCO DE DADOS E USUÁRIO
# ============================================================================

# Conectar ao PostgreSQL como admin
psql -U postgres

# Dentro do psql:
-- Criar usuário
CREATE USER baby_john_user WITH PASSWORD 'baby_john_password';

-- Criar banco de dados
CREATE DATABASE baby_john_db OWNER baby_john_user;

-- Dar privilégios
GRANT ALL PRIVILEGES ON DATABASE baby_john_db TO baby_john_user;

-- Conectar ao novo banco
\c baby_john_db

-- Dar privilégios no schema
GRANT ALL ON SCHEMA public TO baby_john_user;

-- Sair
\q

# ============================================================================
# 4. CONFIGURAR VARIÁVEIS DE AMBIENTE
# ============================================================================

# Copiar .env.example para .env
cp backend/.env.example backend/.env

# Editar backend/.env com suas configurações:
# DATABASE_URL=postgresql+psycopg://baby_john_user:baby_john_password@localhost:5432/baby_john_db
# SECRET_KEY=sua_chave_secreta_aqui

# ============================================================================
# 5. INICIALIZAR BANCO DE DADOS
# ============================================================================

# Navigate to backend folder
cd backend

# Executar script de inicialização
python init_db.py

# Output esperado:
# ==================================================
# INICIALIZAÇÃO BABY JOHN DATABASE
# ==================================================
# ✓ Conexão com PostgreSQL estabelecida
# ✓ Tabelas criadas com sucesso
# ✓ Usuário de teste criado
#   Email: test@babyjohn.com
#   Password: password123
# 
# ==================================================
# ✓ Banco de dados pronto!
# ==================================================

# ============================================================================
# 6. INICIAR O SERVIDOR
# ============================================================================

# Dev mode com reload
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# ============================================================================
# 7. TESTAR A API
# ============================================================================

# Documentação interativa:
http://localhost:8000/docs

# Health check:
curl http://localhost:8000/api/health

# Login (obter token):
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@babyjohn.com","password":"password123"}'

# Response:
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "token_type": "bearer"
# }

# Usar token para acessar endpoint protegido:
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Criar atividade:
curl -X POST "http://localhost:8000/api/activities" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "amamentacao",
    "title": "Amamentação",
    "subtitle": "Lado direito",
    "timestamp": "2026-09-09T10:30:00",
    "dateStr": "2026-09-09",
    "timeStr": "10:30",
    "period": "Manhã",
    "isInProgress": false,
    "durationMinutes": 15,
    "assignee": "Mamãe",
    "details": {"side": "right"}
  }'

# ============================================================================
# 8. ESTRUTURA DE TABELAS CRIADAS
# ============================================================================

# users
#   - id (UUID primary key)
#   - email (unique)
#   - name
#   - password_hash (bcrypt)
#   - baby_name
#   - baby_birth_date
#   - role
#   - is_active
#   - created_at, updated_at

# activities
#   - id (UUID primary key)
#   - user_id (FK → users.id)
#   - type ('amamentacao', 'sono', 'fralda', 'comeu', 'custom')
#   - title, subtitle
#   - timestamp, date_str, time_str
#   - period ('Manhã', 'Tarde', 'Noite')
#   - is_in_progress
#   - duration_minutes
#   - assignee
#   - details (JSONB)
#   - created_at, updated_at

# custom_activities
#   - id (UUID primary key)
#   - user_id (FK → users.id)
#   - name
#   - type ('time' ou 'instant')
#   - icon
#   - description
#   - is_default
#   - created_at, updated_at

# audit_logs
#   - id (UUID primary key)
#   - user_id (FK → users.id, nullable)
#   - action ('CREATE', 'READ', 'UPDATE', 'DELETE')
#   - resource_type
#   - resource_id
#   - ip_address, user_agent
#   - changes (JSONB)
#   - created_at

# api_keys
#   - id (UUID primary key)
#   - user_id (FK → users.id)
#   - key_hash (unique)
#   - name
#   - is_active
#   - last_used_at
#   - created_at, expires_at

# ============================================================================
# 9. PROTEÇÃO CONTRA SQL INJECTION
# ============================================================================

# Todas as queries usam SQLAlchemy com operações parametrizadas:
# ✓ Queries com filters automáticos
# ✓ Sem concatenação de strings SQL
# ✓ Sem eval() ou exec()
# ✓ Pydantic validation para inputs

# Exemplo seguro:
# from sqlalchemy import select
# query = select(User).where(User.email == user_input)
# result = db.execute(query).scalar_one_or_none()

# ============================================================================
# 10. RATE LIMITING
# ============================================================================

# SlowAPI middleware implementado:
# - /api/health: 10/minute
# - /: 10/minute
# - Default: 100/minute para outras rotas

# Response quando rate limit é excedido:
# HTTP 429 Too Many Requests
# {
#   "detail": "Rate limit exceeded. Try again later.",
#   "retry_after": "60"
# }

# ============================================================================
# 11. AUDITORIA
# ============================================================================

# Todas as operações são registradas em audit_logs:
# - CREATE activity: registra novo ID
# - UPDATE activity: registra mudanças (JSONB)
# - DELETE activity: registra ID deletado
# - IP address e user agent capturados
# - Timestamp preciso com timezone

# Query exemplo:
# SELECT * FROM audit_logs 
# WHERE user_id = 'user-uuid' 
# AND created_at > NOW() - INTERVAL '24 hours'
# ORDER BY created_at DESC

# ============================================================================
# 12. TROUBLESHOOTING
# ============================================================================

# "connection refused" na porta 5432:
# - Verificar se PostgreSQL está rodando
# - Windows: net start postgresql-x64-14 (ou versão)
# - Linux: sudo systemctl start postgresql
# - macOS: brew services start postgresql

# "password authentication failed":
# - Verificar DATABASE_URL em .env
# - Verificar password do usuário no PostgreSQL

# "database does not exist":
# - Rodar os comandos de criação de banco acima
# - Ou executar: python init_db.py

# "column does not exist":
# - Deletar banco e recriar: DROP DATABASE baby_john_db;
# - Recriar: python init_db.py

# ============================================================================
