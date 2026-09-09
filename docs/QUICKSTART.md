# 🚀 Quick Start - Baby John API

## Início Rápido (5 minutos)

### 1️⃣ Clonar e Preparar
```bash
cd app_baby/backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Ativar (macOS/Linux)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 2️⃣ Configurar Banco de Dados

#### Windows (WSL2 ou PostgreSQL nativo)
```bash
# Conexão no psql
psql -U postgres

# Dentro do psql:
CREATE USER baby_john_user WITH PASSWORD 'baby_john_password';
CREATE DATABASE baby_john_db OWNER baby_john_user;
GRANT ALL PRIVILEGES ON DATABASE baby_john_db TO baby_john_user;
\q
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
psql -U postgres  # (usar comandos acima)
```

#### Linux
```bash
sudo apt-get install postgresql
sudo -u postgres psql
# (usar comandos acima)
```

### 3️⃣ Variáveis de Ambiente
```bash
cp .env.example .env
# Editar .env se necessário (opcional, defaults funcionam)
```

### 4️⃣ Inicializar Banco
```bash
python init_db.py
```

Saída esperada:
```
==================================================
INICIALIZAÇÃO BABY JOHN DATABASE
==================================================

✓ Conexão com PostgreSQL estabelecida
✓ Tabelas criadas com sucesso
✓ Usuário de teste criado
  Email: test@babyjohn.com
  Password: password123

==================================================
✓ Banco de dados pronto!
==================================================
```

### 5️⃣ Iniciar Servidor
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Saída esperada:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 6️⃣ Acessar API

**Documentação Interativa:**
```
http://localhost:8000/docs
```

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Login (obter token):**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@babyjohn.com",
    "password": "password123"
  }'
```

Resposta:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Usar Token:**
```bash
# Copiar access_token da resposta anterior
TOKEN="seu_token_aqui"

# Buscar dados do usuário
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

**Criar Atividade:**
```bash
curl -X POST "http://localhost:8000/api/activities" \
  -H "Authorization: Bearer $TOKEN" \
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
```

## 🧪 Testes

```bash
# Suite completa de testes
python test_api.py

# Validar schema do banco
python validate_schema.py
```

## 📚 Documentação Completa

- **README.md** - Visão geral e arquitetura
- **DATABASE_SETUP.md** - Setup detalhado do PostgreSQL
- **DEPLOYMENT.md** - Deploy em produção
- **/docs** - Swagger UI (quando servidor rodando)

## 🆘 Problemas Comuns

### "Connection refused" porta 5432
PostgreSQL não está rodando. Inicie com:
```bash
# Windows (WSL)
sudo service postgresql start

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### "password authentication failed"
Verifique DATABASE_URL em `.env`. Padrão:
```
DATABASE_URL=postgresql+psycopg://baby_john_user:baby_john_password@localhost:5432/baby_john_db
```

### "database does not exist"
Execute `python init_db.py` novamente

### ModuleNotFoundError
Ative o virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

## 📋 Estrutura de Pastas

```
backend/
├── main.py                    # App FastAPI
├── database.py                # Config PostgreSQL
├── models.py                  # SQLAlchemy models
├── crud.py                    # Operations
├── schemas.py                 # Pydantic models
├── config.py                  # Settings
├── auth.py                    # JWT auth
├── security.py                # Hash/validation
├── middleware.py              # Rate limiting
├── rate_limiter.py            # Limiter config
├── routers/
│   ├── auth.py                # Auth endpoints
│   ├── activities.py          # Activity endpoints
│   └── __init__.py
├── init_db.py                 # Setup script
├── test_api.py                # Tests
├── validate_schema.py         # Schema validation
├── migrate_from_mock.py       # Data migration
├── requirements.txt           # Dependencies
├── .env.example               # Env template
├── .gitignore                 # Git ignore
├── README.md                  # Full docs
├── QUICKSTART.md              # This file
├── DATABASE_SETUP.md          # DB setup guide
├── DEPLOYMENT.md              # Production guide
└── postman_collection.json    # Postman tests
```

## 🔑 Credenciais Padrão

**Usuário de teste criado automaticamente:**
- Email: `test@babyjohn.com`
- Senha: `password123`

**Em produção, altere imediatamente!**

## ✅ Próximos Passos

1. ✅ Backend PostgreSQL rodando
2. ⏭️ Conectar frontend ao backend
3. ⏭️ Testar endpoints com sua aplicação
4. ⏭️ Deploy em produção quando pronto

## 📞 Support

Para problemas, consulte:
1. `DATABASE_SETUP.md` - Problemas com banco
2. `README.md` - Documentação técnica
3. `DEPLOYMENT.md` - Problemas de deploy
4. Logs: `python -m uvicorn main:app --reload --log-level debug`

---

**Versão**: 1.0.0  
**Última atualização**: 2026-09-09
