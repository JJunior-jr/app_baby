# 📁 Estrutura de Pastas - Baby John Project

## 🎯 Objetivo: Organização Profissional por Função

```
app_baby/
│
├── 📦 backend/                          # API Backend (FastAPI)
│   ├── app/                             # Código da aplicação
│   │   ├── routers/                     # Rotas e endpoints da API
│   │   │   ├── __init__.py
│   │   │   ├── activities.py            # Endpoints de atividades
│   │   │   ├── auth.py                  # Endpoints de autenticação
│   │   │   ├── users.py                 # Endpoints de usuários
│   │   │   └── health.py                # Health check
│   │   │
│   │   ├── models/                      # Modelos SQLAlchemy (Banco de Dados)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  # Base model com UUID
│   │   │   ├── activity.py              # Modelo Activity
│   │   │   ├── user.py                  # Modelo User
│   │   │   ├── audit_log.py             # Modelo para auditoria
│   │   │   └── api_key.py               # Modelo para API keys
│   │   │
│   │   ├── schemas/                     # Pydantic schemas (Validação)
│   │   │   ├── __init__.py
│   │   │   ├── activity.py              # Schemas de atividades
│   │   │   ├── user.py                  # Schemas de usuários
│   │   │   ├── auth.py                  # Schemas de autenticação
│   │   │   └── common.py                # Schemas comuns
│   │   │
│   │   ├── services/                    # Lógica de negócio
│   │   │   ├── __init__.py
│   │   │   ├── activity_service.py      # Serviços de atividades
│   │   │   ├── user_service.py          # Serviços de usuários
│   │   │   ├── auth_service.py          # Serviços de autenticação
│   │   │   ├── sync_service.py          # Serviço de sincronização offline
│   │   │   └── email_service.py         # Serviço de email (futuro)
│   │   │
│   │   ├── database/                    # Configuração do Banco de Dados
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  # Declarative base
│   │   │   ├── connection.py            # Pool de conexões
│   │   │   ├── migrations/              # Alembic migrations
│   │   │   │   └── versions/
│   │   │   └── seeds/                   # Dados iniciais
│   │   │       ├── __init__.py
│   │   │       ├── seed_users.py        # Dados de usuários
│   │   │       └── seed_activities.py   # Dados de atividades
│   │   │
│   │   ├── auth/                        # Autenticação e Segurança
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py                   # JWT tokens
│   │   │   ├── password.py              # Hash e verificação de senhas
│   │   │   ├── dependencies.py          # Dependências FastAPI (auth)
│   │   │   └── permissions.py           # Verificação de permissões
│   │   │
│   │   ├── middleware/                  # Middlewares
│   │   │   ├── __init__.py
│   │   │   ├── cors.py                  # CORS configuration
│   │   │   ├── rate_limit.py            # Rate limiting
│   │   │   ├── logging.py               # Logging middleware
│   │   │   └── error_handler.py         # Error handling
│   │   │
│   │   ├── utils/                       # Utilitários
│   │   │   ├── __init__.py
│   │   │   ├── validators.py            # Validadores customizados
│   │   │   ├── formatters.py            # Formatadores de dados
│   │   │   ├── constants.py             # Constantes da aplicação
│   │   │   └── exceptions.py            # Exceções customizadas
│   │   │
│   │   ├── main.py                      # Aplicação FastAPI principal
│   │   └── config.py                    # Configurações
│   │
│   ├── tests/                           # Testes
│   │   ├── __init__.py
│   │   ├── conftest.py                  # Configuração pytest
│   │   ├── unit/                        # Testes unitários
│   │   │   ├── test_models.py
│   │   │   ├── test_schemas.py
│   │   │   └── test_services.py
│   │   ├── integration/                 # Testes de integração
│   │   │   ├── test_auth.py
│   │   │   └── test_activities.py
│   │   └── e2e/                         # Testes end-to-end
│   │       └── test_api_flow.py
│   │
│   ├── Dockerfile                       # Docker image
│   ├── requirements.txt                 # Dependências Python
│   ├── .env.example                     # Template de variáveis
│   ├── pytest.ini                       # Configuração pytest
│   └── README.md                        # README do backend
│
├── 📱 frontend/                         # React Frontend
│   ├── src/
│   │   ├── pages/                       # Páginas principais
│   │   │   ├── HomePage.tsx
│   │   │   ├── DiaryPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── LoginPage.tsx
│   │   │
│   │   ├── components/                  # Componentes reutilizáveis
│   │   │   ├── common/                  # Componentes genéricos
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── activities/              # Componentes de atividades
│   │   │   │   ├── ActivityList.tsx
│   │   │   │   ├── ActivityForm.tsx
│   │   │   │   └── ActivityCard.tsx
│   │   │   └── auth/                    # Componentes de autenticação
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   │
│   │   ├── services/                    # Serviços (API calls)
│   │   │   ├── api.ts                   # Cliente HTTP
│   │   │   ├── authService.ts           # Autenticação
│   │   │   ├── activityService.ts       # Atividades
│   │   │   └── storageService.ts        # LocalStorage
│   │   │
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useActivities.ts
│   │   │   └── useFetch.ts
│   │   │
│   │   ├── context/                     # Context API
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ActivityContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── assets/                      # Imagens, ícones
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   ├── styles/                      # Estilos globais
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── themes.css
│   │   │
│   │   ├── types/                       # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── activity.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── App.tsx                      # Componente root
│   │   ├── index.tsx                    # Entry point
│   │   └── vite-env.d.ts                # Tipos Vite
│   │
│   ├── public/                          # Arquivos estáticos
│   │   └── index.html
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── 🐳 docker/                           # Docker & Infraestrutura
│   ├── dev/
│   │   ├── docker-compose.yml           # Dev environment
│   │   ├── .env.dev                     # Dev variables
│   │   └── Dockerfile.dev               # Dev image
│   │
│   ├── prod/
│   │   ├── docker-compose.yml           # Prod environment
│   │   ├── .env.prod                    # Prod variables
│   │   ├── Dockerfile                   # Prod image
│   │   ├── nginx.conf                   # Nginx config
│   │   └── ssl/                         # SSL certificates
│   │
│   └── compose-override.yml             # Local overrides
│
├── 📚 docs/                             # Documentação
│   ├── README.md                        # Índice da documentação
│   ├── SETUP.md                         # Setup inicial
│   ├── architecture/
│   │   ├── system_architecture.md       # Arquitetura do sistema
│   │   ├── database_schema.md           # Schema do BD
│   │   └── data_flow.md                 # Fluxo de dados
│   ├── api/
│   │   ├── README.md                    # Índice API
│   │   ├── authentication.md            # Auth endpoints
│   │   ├── activities.md                # Activity endpoints
│   │   └── users.md                     # User endpoints
│   ├── deployment/
│   │   ├── docker_setup.md              # Setup Docker
│   │   ├── production.md                # Prod deployment
│   │   ├── monitoring.md                # Monitoramento
│   │   └── backup.md                    # Backup procedures
│   ├── guides/
│   │   ├── development.md               # Dev guide
│   │   ├── testing.md                   # Testing guide
│   │   ├── contributing.md              # Contribution guidelines
│   │   └── troubleshooting.md           # Troubleshooting
│   └── CHANGELOG.md                     # Histórico de mudanças
│
├── 🔧 scripts/                          # Scripts de automação
│   ├── database/
│   │   ├── seed_db.sh                   # Seed database
│   │   ├── backup_db.sh                 # Backup database
│   │   └── restore_db.sh                # Restore database
│   ├── deployment/
│   │   ├── deploy.sh                    # Deploy script
│   │   ├── rollback.sh                  # Rollback script
│   │   └── health_check.sh              # Health check
│   └── setup/
│       ├── setup.sh                     # Initial setup
│       └── install_dependencies.sh      # Install deps
│
├── ⚙️ config/                           # Configurações
│   ├── nginx/
│   │   ├── nginx.conf                   # Main config
│   │   └── ssl.conf                     # SSL config
│   └── ssl/
│       ├── cert.pem                     # SSL certificate
│       └── key.pem                      # SSL key
│
├── 🔒 .gitignore                        # Git ignore
├── 🔒 .env                              # Dev environment
├── 🔒 .env.prod                         # Prod environment
│
├── 📄 docker-compose.yml                # Dev docker-compose
├── 📄 docker-compose.prod.yml           # Prod docker-compose
├── 📄 Dockerfile                        # Root Dockerfile (opcional)
│
├── 📖 README.md                         # README raiz
├── 📖 CONTRIBUTING.md                   # Guidelines
├── 📖 LICENSE                           # License
│
└── 📋 package.json                      # Monorepo dependencies (opcional)
```

---

## 📊 Resumo da Organização

### Backend (`/backend`)
**Objetivo:** API FastAPI com PostgreSQL

| Pasta | Finalidade |
|-------|-----------|
| `routers/` | Endpoints HTTP (activities, auth, users) |
| `models/` | Modelos SQLAlchemy (estrutura BD) |
| `schemas/` | Validação Pydantic (request/response) |
| `services/` | Lógica de negócio |
| `database/` | Conexão BD, migrations, seeds |
| `auth/` | JWT, passwords, permissões |
| `middleware/` | CORS, rate limiting, logging |
| `utils/` | Validadores, formatadores, constantes |
| `tests/` | Testes unitários, integração, e2e |

### Frontend (`/frontend`)
**Objetivo:** React app mobile-first

| Pasta | Finalidade |
|-------|-----------|
| `pages/` | Páginas principais |
| `components/` | Componentes reutilizáveis |
| `services/` | API calls |
| `hooks/` | Custom React hooks |
| `context/` | State management |
| `assets/` | Imagens, ícones |
| `styles/` | CSS global, temas |
| `types/` | TypeScript definitions |

### Docker (`/docker`)
**Objetivo:** Containerização

| Pasta | Finalidade |
|-------|-----------|
| `dev/` | Ambiente desenvolvimento |
| `prod/` | Ambiente produção |

### Documentação (`/docs`)
**Objetivo:** Guias e referências

| Pasta | Finalidade |
|-------|-----------|
| `architecture/` | Design do sistema |
| `api/` | Referência de endpoints |
| `deployment/` | Deploy procedures |
| `guides/` | Tutoriais e guias |

### Scripts (`/scripts`)
**Objetivo:** Automação

| Pasta | Finalidade |
|-------|-----------|
| `database/` | Scripts BD (backup, seed) |
| `deployment/` | Deploy, health check |
| `setup/` | Setup inicial |

### Config (`/config`)
**Objetivo:** Configurações da infraestrutura

| Pasta | Finalidade |
|-------|-----------|
| `nginx/` | Nginx configuration |
| `ssl/` | SSL certificates |

---

## 🎯 Benefícios dessa Organização

✅ **Modularidade** - Cada componente tem sua responsabilidade  
✅ **Escalabilidade** - Fácil adicionar novos serviços/rotas  
✅ **Manutenibilidade** - Código organizado e fácil de navegar  
✅ **Testabilidade** - Estrutura clara para testes  
✅ **Documentação** - Docs centralizadas e organizadas  
✅ **Colaboração** - Time sabe onde procurar cada coisa  
✅ **CI/CD** - Fácil integração com pipelines  

---

## 🚀 Como Usar essa Estrutura

### Backend
```bash
# Nova rota
touch backend/app/routers/new_feature.py

# Novo modelo
touch backend/app/models/new_model.py

# Novo serviço
touch backend/app/services/new_service.py

# Novo teste
touch backend/tests/unit/test_new_feature.py
```

### Frontend
```bash
# Nova página
touch frontend/src/pages/NewPage.tsx

# Novo componente
touch frontend/src/components/NewComponent.tsx

# Novo hook
touch frontend/src/hooks/useNewHook.ts

# Novo serviço
touch frontend/src/services/newService.ts
```

---

**Essa organização é profissional, escalável e segue best practices da indústria!** ✅
