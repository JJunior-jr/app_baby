# 📁 STRUCTURE DE PASTAS - GUIA COMPLETO

**Status:** 🎯 Pronto para implementar  
**Data:** 2026-09-09

---

## 🚀 Como Criar a Estrutura

Como o comando bash/powershell não está disponível no momento, aqui estão as instruções para criar manualmente:

### Opção 1: Terminal (Bash/Git Bash)

```bash
cd app_baby

# Backend
mkdir -p backend/app/{routers,models,schemas,services,middleware,auth,utils}
mkdir -p backend/app/database/{migrations,seeds}
mkdir -p backend/tests/{unit,integration,e2e}
mkdir -p backend/config

# Frontend
mkdir -p frontend/src/{pages,components/common,components/activities,components/auth}
mkdir -p frontend/src/{hooks,context,assets/images,assets/icons,styles,types}
mkdir -p frontend/public

# Documentação
mkdir -p docs/{architecture,api,deployment,guides}

# Scripts
mkdir -p scripts/{database,deployment,setup}

# Config & Docker
mkdir -p config/{nginx,ssl}
mkdir -p docker/{dev,prod}
```

### Opção 2: PowerShell

```powershell
cd app_baby

# Backend
New-Item -ItemType Directory -Path "backend/app/routers","backend/app/models","backend/app/schemas","backend/app/services" -Force
New-Item -ItemType Directory -Path "backend/app/middleware","backend/app/auth","backend/app/utils" -Force
New-Item -ItemType Directory -Path "backend/app/database/migrations","backend/app/database/seeds" -Force
New-Item -ItemType Directory -Path "backend/tests/unit","backend/tests/integration","backend/tests/e2e" -Force
New-Item -ItemType Directory -Path "backend/config" -Force

# Frontend
New-Item -ItemType Directory -Path "frontend/src/pages","frontend/src/components/common","frontend/src/components/activities" -Force
New-Item -ItemType Directory -Path "frontend/src/components/auth","frontend/src/hooks","frontend/src/context" -Force
New-Item -ItemType Directory -Path "frontend/src/assets/images","frontend/src/assets/icons","frontend/src/styles","frontend/src/types" -Force
New-Item -ItemType Directory -Path "frontend/public" -Force

# Documentação
New-Item -ItemType Directory -Path "docs/architecture","docs/api","docs/deployment","docs/guides" -Force

# Scripts
New-Item -ItemType Directory -Path "scripts/database","scripts/deployment","scripts/setup" -Force

# Config & Docker
New-Item -ItemType Directory -Path "config/nginx","config/ssl" -Force
New-Item -ItemType Directory -Path "docker/dev","docker/prod" -Force
```

### Opção 3: Windows Explorer

1. Crie as pastas manualmente seguindo a estrutura abaixo
2. Ou use a árvore de diretórios fornecida neste guia

---

## 📂 Estrutura Completa Detalhada

```
app_baby/
│
├── 📦 backend/                          # API Backend (FastAPI + PostgreSQL)
│   ├── app/                             # Código da aplicação
│   │   ├── __init__.py
│   │   ├── main.py                      ⭐ FastAPI app instance
│   │   ├── config.py                    ⭐ Configurações (env, secrets, etc)
│   │   │
│   │   ├── routers/                     📍 ENDPOINTS HTTP
│   │   │   ├── __init__.py
│   │   │   ├── activities.py            🔗 GET/POST/PUT/DELETE /activities
│   │   │   ├── auth.py                  🔗 POST /token, /register, /me
│   │   │   ├── users.py                 🔗 GET/PUT /users/{id}
│   │   │   ├── health.py                🔗 GET /health
│   │   │   └── sync.py                  🔗 POST /sync (offline sync)
│   │   │
│   │   ├── models/                      📊 MODELOS BANCO DE DADOS (SQLAlchemy)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  Base model com UUID
│   │   │   ├── activity.py              Activity(id, type, timestamp, details)
│   │   │   ├── user.py                  User(id, email, name, babyName)
│   │   │   ├── audit_log.py             AuditLog(action, user, timestamp)
│   │   │   └── api_key.py               APIKey(token, permissions)
│   │   │
│   │   ├── schemas/                     ✅ VALIDAÇÃO (Pydantic)
│   │   │   ├── __init__.py
│   │   │   ├── activity.py              ActivityCreate, ActivityRead, ActivityUpdate
│   │   │   ├── user.py                  UserCreate, UserRead, UserUpdate
│   │   │   ├── auth.py                  LoginRequest, TokenResponse, RegisterRequest
│   │   │   └── common.py                PaginatedResponse, ErrorResponse
│   │   │
│   │   ├── services/                    ⚙️ LÓGICA DE NEGÓCIO
│   │   │   ├── __init__.py
│   │   │   ├── activity_service.py      create_activity(), list_activities(), update_activity()
│   │   │   ├── user_service.py          create_user(), get_user(), update_profile()
│   │   │   ├── auth_service.py          authenticate(), create_token(), verify_token()
│   │   │   ├── sync_service.py          sync_pending_queue(), process_offline_items()
│   │   │   └── email_service.py         send_email() [Future: Sendgrid]
│   │   │
│   │   ├── database/                    🗄️ BANCO DE DADOS
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  Declarative base para modelos
│   │   │   ├── connection.py            Database URL, engine, sessionmaker
│   │   │   ├── crud.py                  CRUD operations (get, create, update, delete)
│   │   │   ├── migrations/              Alembic migrations
│   │   │   │   ├── env.py
│   │   │   │   ├── script.py.mako
│   │   │   │   └── versions/            Histórico de migrations
│   │   │   └── seeds/                   Dados iniciais
│   │   │       ├── __init__.py
│   │   │       ├── seed_users.py        Usuários padrão (Papai, etc)
│   │   │       └── seed_activities.py   Atividades de exemplo
│   │   │
│   │   ├── auth/                        🔐 AUTENTICAÇÃO & SEGURANÇA
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py                   create_token(), verify_token()
│   │   │   ├── password.py              hash_password(), verify_password()
│   │   │   ├── dependencies.py          get_current_user() - FastAPI dependency
│   │   │   └── permissions.py           check_permissions(), require_admin()
│   │   │
│   │   ├── middleware/                  🛡️ MIDDLEWARES
│   │   │   ├── __init__.py
│   │   │   ├── cors.py                  CORS configuration
│   │   │   ├── rate_limit.py            Rate limiting setup
│   │   │   ├── logging.py               Request/response logging
│   │   │   └── error_handler.py         Global error handling
│   │   │
│   │   └── utils/                       🔧 UTILITÁRIOS
│   │       ├── __init__.py
│   │       ├── validators.py            Email validator, date validator
│   │       ├── formatters.py            Format phone, date, timestamps
│   │       ├── constants.py             Activity types, periods, constants
│   │       └── exceptions.py            CustomException classes
│   │
│   ├── tests/                           🧪 TESTES
│   │   ├── __init__.py
│   │   ├── conftest.py                  pytest fixtures, db setup
│   │   ├── unit/                        Testes unitários (services, utils)
│   │   │   ├── test_auth_service.py
│   │   │   ├── test_activity_service.py
│   │   │   └── test_validators.py
│   │   ├── integration/                 Testes com DB real
│   │   │   ├── test_auth_api.py
│   │   │   └── test_activities_api.py
│   │   └── e2e/                         Testes completos (user flow)
│   │       └── test_user_workflow.py
│   │
│   ├── Dockerfile                       🐳 Docker image
│   ├── requirements.txt                 📦 Dependências Python
│   ├── .env.example                     Template de variáveis
│   ├── pytest.ini                       Configuração pytest
│   └── README.md                        README backend
│
├── 📱 frontend/                         React App (Mobile-First)
│   ├── src/
│   │   ├── pages/                       📄 PÁGINAS PRINCIPAIS
│   │   │   ├── HomePage.tsx             Dashboard home
│   │   │   ├── DiaryPage.tsx            Registro de atividades
│   │   │   ├── SettingsPage.tsx         Configurações
│   │   │   ├── HealthPage.tsx           Saúde do bebê
│   │   │   └── LoginPage.tsx            Login
│   │   │
│   │   ├── components/                  🧩 COMPONENTES REUTILIZÁVEIS
│   │   │   ├── common/                  Genéricos
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── activities/              Específicos de atividades
│   │   │   │   ├── ActivityList.tsx
│   │   │   │   ├── ActivityForm.tsx
│   │   │   │   └── ActivityCard.tsx
│   │   │   └── auth/                    Autenticação
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   │
│   │   ├── services/                    🌐 API CALLS & STORAGE
│   │   │   ├── api.ts                   Cliente HTTP (axios/fetch)
│   │   │   ├── authService.ts           login(), register(), logout()
│   │   │   ├── activityService.ts       getActivities(), createActivity()
│   │   │   └── storageService.ts        localStorage, sessionStorage
│   │   │
│   │   ├── hooks/                       🎣 CUSTOM HOOKS
│   │   │   ├── useAuth.ts               Auth state & logic
│   │   │   ├── useActivities.ts         Activities state & logic
│   │   │   ├── useFetch.ts              Fetch data with loading/error
│   │   │   └── useLocalStorage.ts       Sync with localStorage
│   │   │
│   │   ├── context/                     📦 STATE MANAGEMENT
│   │   │   ├── AuthContext.tsx          User, token, auth state
│   │   │   ├── ActivityContext.tsx      Activities, filters
│   │   │   └── ThemeContext.tsx         Light/dark mode, colors
│   │   │
│   │   ├── assets/                      🎨 MÍDIA
│   │   │   ├── images/                  PNG, JPG, SVG
│   │   │   ├── icons/                   Icons SVG
│   │   │   └── fonts/                   Custom fonts
│   │   │
│   │   ├── styles/                      🎨 ESTILOS GLOBAIS
│   │   │   ├── global.css               Reset, fontes
│   │   │   ├── variables.css            CSS variables (cores, spacing)
│   │   │   └── themes.css               Light/dark themes
│   │   │
│   │   ├── types/                       📋 TYPESCRIPT TYPES
│   │   │   ├── index.ts                 Main types
│   │   │   ├── activity.ts              Activity interfaces
│   │   │   └── user.ts                  User interfaces
│   │   │
│   │   ├── App.tsx                      Root component
│   │   ├── index.tsx                    Entry point
│   │   └── vite-env.d.ts                Tipos Vite
│   │
│   ├── public/                          Arquivos estáticos
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js               (se usar Tailwind)
│   └── README.md
│
├── 📚 docs/                             DOCUMENTAÇÃO
│   ├── README.md                        Índice de docs
│   ├── SETUP.md                         Setup inicial
│   ├── architecture/
│   │   ├── system_architecture.md       Diagrama da arquitetura
│   │   ├── database_schema.md           Schema PostgreSQL
│   │   ├── data_flow.md                 Fluxo de dados app
│   │   └── offline_sync.md              Como funciona sync offline
│   ├── api/
│   │   ├── README.md                    Overview endpoints
│   │   ├── authentication.md            Auth endpoints
│   │   ├── activities.md                Activity endpoints
│   │   ├── users.md                     User endpoints
│   │   └── responses.md                 Response formats
│   ├── deployment/
│   │   ├── docker_setup.md              Setup Docker
│   │   ├── production.md                Production deployment
│   │   ├── monitoring.md                Monitoramento & logs
│   │   └── backup.md                    Backup procedures
│   ├── guides/
│   │   ├── development.md               Dev guide
│   │   ├── testing.md                   Testing guide
│   │   ├── contributing.md              Contribution guidelines
│   │   └── troubleshooting.md           Troubleshooting
│   └── CHANGELOG.md                     Histórico versões
│
├── 🔧 scripts/                          AUTOMAÇÃO
│   ├── database/
│   │   ├── seed_db.sh                   Seed database com dados
│   │   ├── backup_db.sh                 Backup PostgreSQL
│   │   └── restore_db.sh                Restore from backup
│   ├── deployment/
│   │   ├── deploy.sh                    Deploy to production
│   │   ├── rollback.sh                  Rollback version
│   │   └── health_check.sh              Health check API
│   └── setup/
│       ├── setup.sh                     Initial setup
│       └── install_dependencies.sh      Install Python/Node deps
│
├── ⚙️ config/                           CONFIGURAÇÕES
│   ├── nginx/
│   │   ├── nginx.conf                   Main nginx config
│   │   ├── ssl.conf                     SSL/TLS config
│   │   └── rate_limit.conf              Rate limit rules
│   └── ssl/
│       ├── cert.pem                     SSL certificate
│       └── key.pem                      SSL private key
│
├── 🐳 docker/                           DOCKER
│   ├── dev/
│   │   ├── docker-compose.yml           Dev environment
│   │   ├── Dockerfile.dev               Dev image
│   │   └── .env.dev                     Dev variables
│   ├── prod/
│   │   ├── docker-compose.yml           Prod environment
│   │   ├── Dockerfile                   Prod image
│   │   ├── nginx.conf                   Nginx config
│   │   └── .env.prod                    Prod variables
│   └── compose-override.yml             Local overrides
│
├── 🔒 .env                              Dev environment (⚠️ .gitignore)
├── 🔒 .env.prod                         Prod environment (⚠️ .gitignore)
├── 🔒 .gitignore                        Git ignore rules
│
├── 📄 docker-compose.yml                Dev compose
├── 📄 docker-compose.prod.yml           Prod compose
│
├── 📖 README.md                         README raiz
├── 📖 CONTRIBUTING.md                   Guidelines
├── 📖 LICENSE                           Licença
└── 📋 package.json                      Scripts root (opcional)
```

---

## 📋 Checklist de Implementação

### Fase 1: Backend
- [ ] Criar estrutura `backend/app/`
- [ ] Criar `routers/` com arquivos vazios
- [ ] Criar `models/` com bases
- [ ] Criar `schemas/` com validadores
- [ ] Criar `services/` com lógica
- [ ] Criar `auth/` com JWT
- [ ] Criar `tests/` com estrutura

### Fase 2: Frontend
- [ ] Criar estrutura `frontend/src/`
- [ ] Criar `pages/`
- [ ] Criar `components/` (common, activities, auth)
- [ ] Criar `services/`
- [ ] Criar `hooks/`
- [ ] Criar `context/`
- [ ] Criar `types/`

### Fase 3: Documentação
- [ ] Criar `docs/architecture/`
- [ ] Criar `docs/api/`
- [ ] Criar `docs/deployment/`
- [ ] Criar `docs/guides/`

### Fase 4: Automação
- [ ] Criar `scripts/database/`
- [ ] Criar `scripts/deployment/`
- [ ] Criar `scripts/setup/`

### Fase 5: Config
- [ ] Criar `config/nginx/`
- [ ] Criar `config/ssl/`
- [ ] Criar `docker/dev/`
- [ ] Criar `docker/prod/`

---

## 🎯 Próximos Passos

1. **Criar as pastas** usando um dos métodos acima
2. **Criar arquivos __init__.py** em cada diretório Python
3. **Copiar arquivos existentes** para novas pastas
4. **Atualizar imports** nos arquivos Python
5. **Commit estrutura** para git

---

**Estrutura profissional e escalável pronta para usar!** ✅
