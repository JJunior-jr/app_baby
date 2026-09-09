# Baby John - PostgreSQL + SQLAlchemy 2.0 Backend

Migração completa do banco de dados em memória para PostgreSQL com SQLAlchemy 2.0. Backend seguro e pronto para produção.

## 🎯 O que foi feito

### 1. Banco de Dados PostgreSQL
- ✓ Modelo relacional completo com 5 tabelas
- ✓ Índices otimizados para performance
- ✓ Constraints de integridade referencial
- ✓ Tipos JSONB para dados flexíveis

### 2. SQLAlchemy 2.0 ORM
- ✓ Models com relationships automáticas
- ✓ Queries parametrizadas (SQL injection prevention)
- ✓ Connection pooling configurado
- ✓ Async-ready para scaling

### 3. Segurança
- ✓ Proteção contra SQL Injection (queries parametrizadas)
- ✓ Hash bcrypt para passwords (5 rounds)
- ✓ JWT tokens com expiração configurável
- ✓ Rate limiting por IP (slowapi)
- ✓ Auditoria completa de operações
- ✓ CORS configurável

### 4. API Endpoints
- ✓ `/api/auth/register` - Registrar usuário
- ✓ `/api/auth/login` - Fazer login (retorna JWT)
- ✓ `/api/auth/me` - Dados do usuário autenticado
- ✓ `/api/activities` - CRUD completo de atividades
- ✓ `/api/activities/daily-summary/{date}` - Resumo diário

## 📁 Arquivos Criados

```
backend/
├── main.py                 # App principal com middleware e routers
├── database.py             # Configuração PostgreSQL e session factory
├── models.py               # SQLAlchemy 2.0 models
├── crud.py                 # CRUD operations com queries parametrizadas
├── schemas.py              # Pydantic models (já existente)
├── config.py               # Settings centralizadas
├── security.py             # Hash e validação (utilitários)
├── auth.py                 # JWT e autenticação
├── middleware.py           # Rate limiting
├── routers/
│   ├── auth.py             # Router de autenticação
│   ├── activities.py        # Router de atividades (ATUALIZADO)
│   └── __init__.py
├── init_db.py              # Script de inicialização
├── DATABASE_SETUP.md       # Guia de setup
├── .env.example            # Template de variáveis
├── test_api.py             # Suite de testes
├── validate_schema.py      # Validação de schema
└── requirements.txt        # Dependências (ATUALIZADO)
```

## 🚀 Quick Start

### 1. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar PostgreSQL
```bash
# Criar usuário e banco (ver DATABASE_SETUP.md para detalhes)
psql -U postgres

CREATE USER baby_john_user WITH PASSWORD 'baby_john_password';
CREATE DATABASE baby_john_db OWNER baby_john_user;
GRANT ALL PRIVILEGES ON DATABASE baby_john_db TO baby_john_user;
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 4. Inicializar banco
```bash
python init_db.py
```

### 5. Iniciar servidor
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Testar API
```bash
# Documentação interativa
http://localhost:8000/docs

# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@babyjohn.com","password":"password123"}'
```

## 🔒 Segurança

### SQL Injection Prevention
Todas as queries usam SQLAlchemy parametrizadas:
```python
# ✓ SEGURO - Parametrizado automaticamente
query = select(Activity).where(Activity.user_id == user_id)
db.execute(query)

# ✗ NUNCA - Concatenação de strings
query = f"SELECT * FROM activities WHERE user_id = '{user_id}'"
```

### Rate Limiting
- `GET /api/health`: 10/minute
- `POST /api/activities`: 30/minute
- `GET /api/activities`: 60/minute
- `DELETE /api/activities/{id}`: 30/minute

### Password Security
- Hash: bcrypt com 5 rounds (automático)
- Storage: salted hash em `users.password_hash`
- Validation: `verify_password()` com timing-safe comparison

### Auditoria
Todas as operações registram:
- User ID e timestamp
- IP address e user agent
- Ação (CREATE, UPDATE, DELETE)
- Dados alterados (JSONB)

## 📊 Estrutura do Banco

### users
- UUID primary key
- Email único
- Password hasheado
- Baby name
- Role-based (admin_parent)
- Soft delete via is_active

### activities
- UUID primary key
- FK → users.id
- Types: amamentacao, sono, fralda, comeu, custom
- Timestamps com timezone
- JSONB details para dados flexíveis
- Índices em (user_id, date_str) e (type)

### custom_activities
- Atividades personalizadas por usuário
- Unique constraint em (user_id, name)

### audit_logs
- Rastreabilidade completa
- Índices em (user_id, created_at) e (resource_type, resource_id)

### api_keys
- Alternativa para autenticação
- Suporta expiração

## 🧪 Testes

```bash
# Suite completa de testes
python test_api.py

# Validar schema do banco
python validate_schema.py
```

## 📝 Rotas da API

### Autenticação

```http
POST /api/auth/register
{
  "email": "papai@email.com",
  "name": "João",
  "babyName": "Baby João",
  "password": "senha123"
}

POST /api/auth/login
{
  "email": "papai@email.com",
  "password": "senha123"
}

GET /api/auth/me
Authorization: Bearer TOKEN
```

### Atividades

```http
POST /api/activities
Authorization: Bearer TOKEN
{
  "type": "amamentacao",
  "title": "Amamentação",
  "timestamp": "2026-09-09T10:30:00",
  "dateStr": "2026-09-09",
  "timeStr": "10:30",
  "period": "Manhã",
  "durationMinutes": 15,
  "assignee": "Mamãe"
}

GET /api/activities?date=2026-09-09&type=amamentacao
Authorization: Bearer TOKEN

GET /api/activities/{id}
Authorization: Bearer TOKEN

PUT /api/activities/{id}
Authorization: Bearer TOKEN
{ ... updated data ... }

DELETE /api/activities/{id}
Authorization: Bearer TOKEN

GET /api/activities/daily-summary/2026-09-09
Authorization: Bearer TOKEN
```

## 🔄 Migração de Mock Data

Se você tinha dados no MOCK_ACTIVITIES anterior:

1. Exportar dados do mock (JSON)
2. Implementar script de migração em `backend/migrate_from_mock.py`
3. Rodar: `python migrate_from_mock.py`

## 📚 Documentação Adicional

- **DATABASE_SETUP.md** - Setup detalhado do PostgreSQL
- **docs/** - Postman collection (próximo)
- Swagger/OpenAPI em `/docs`

## ⚙️ Configurações

Todas as configurações estão em `config.py` e carregadas do `.env`:

```
DATABASE_URL
DATABASE_POOL_SIZE
ACCESS_TOKEN_EXPIRE_MINUTES
CORS_ORIGINS
RATE_LIMIT_DEFAULT
LOG_LEVEL
```

## 🐛 Troubleshooting

### "Connection refused" porta 5432
```bash
# Windows
net start postgresql-x64-14

# Linux
sudo systemctl start postgresql

# macOS
brew services start postgresql
```

### "password authentication failed"
Verificar DATABASE_URL em `.env`

### "database does not exist"
```bash
python init_db.py
```

## 📈 Próximos Passos

- [ ] Migrations (Alembic)
- [ ] GraphQL endpoint
- [ ] WebSocket para sync em tempo real
- [ ] Backup/recovery scripts
- [ ] Performance monitoring
- [ ] Caching com Redis

## ✅ Checklist de Produção

- [ ] Alterar SECRET_KEY
- [ ] Configurar DATABASE_URL do servidor
- [ ] Ativar HTTPS/SSL
- [ ] Revisar CORS_ORIGINS
- [ ] Aumentar ACCESS_TOKEN_EXPIRE_MINUTES
- [ ] Configurar logging centralizado
- [ ] Setup de backups automáticos
- [ ] Monitoramento e alertas
- [ ] Load testing

---

**Status**: ✅ Pronto para desenvolvimento  
**Última atualização**: 2026-09-09  
**Versão**: 1.0.0
