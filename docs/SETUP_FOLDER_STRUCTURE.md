# 🚀 INSTRUÇÕES - Como Organizar o Projeto

**Objetivo:** Reorganizar Baby John com estrutura profissional

**Tempo Estimado:** 30 minutos

---

## PASSO 1: Criar Estrutura de Pastas

### Linux / Mac / Git Bash
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

# Docs & Scripts
mkdir -p docs/{architecture,api,deployment,guides}
mkdir -p scripts/{database,deployment,setup}
mkdir -p config/{nginx,ssl}
mkdir -p docker/{dev,prod}
```

### Windows (PowerShell)
```powershell
cd app_baby

# Backend
New-Item -ItemType Directory -Path "backend/app/routers","backend/app/models","backend/app/schemas" -Force
New-Item -ItemType Directory -Path "backend/app/services","backend/app/middleware","backend/app/auth","backend/app/utils" -Force
New-Item -ItemType Directory -Path "backend/app/database/migrations","backend/app/database/seeds" -Force
New-Item -ItemType Directory -Path "backend/tests/unit","backend/tests/integration","backend/tests/e2e" -Force
New-Item -ItemType Directory -Path "backend/config" -Force

# Frontend
New-Item -ItemType Directory -Path "frontend/src/pages" -Force
New-Item -ItemType Directory -Path "frontend/src/components/common","frontend/src/components/activities","frontend/src/components/auth" -Force
New-Item -ItemType Directory -Path "frontend/src/hooks","frontend/src/context" -Force
New-Item -ItemType Directory -Path "frontend/src/assets/images","frontend/src/assets/icons","frontend/src/styles","frontend/src/types" -Force
New-Item -ItemType Directory -Path "frontend/public" -Force

# Docs & Scripts
New-Item -ItemType Directory -Path "docs/architecture","docs/api","docs/deployment","docs/guides" -Force
New-Item -ItemType Directory -Path "scripts/database","scripts/deployment","scripts/setup" -Force
New-Item -ItemType Directory -Path "config/nginx","config/ssl" -Force
New-Item -ItemType Directory -Path "docker/dev","docker/prod" -Force
```

---

## PASSO 2: Mover Arquivos Backend

```bash
# Mover arquivos existentes para novas pastas
mv backend/routers/* backend/app/routers/
mv backend/models/* backend/app/models/
mv backend/schemas* backend/app/schemas/

# Se houver database setup
# mv backend/database.py backend/app/database/connection.py
# mv backend/crud.py backend/app/database/crud.py
# mv backend/models.py backend/app/models/

# Mover main.py e config
# mv backend/main.py backend/app/
# mv backend/config.py backend/app/
```

---

## PASSO 3: Criar Arquivos __init__.py

```bash
# Backend
touch backend/__init__.py
touch backend/app/__init__.py
touch backend/app/routers/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/services/__init__.py
touch backend/app/middleware/__init__.py
touch backend/app/auth/__init__.py
touch backend/app/utils/__init__.py
touch backend/app/database/__init__.py
touch backend/app/database/migrations/__init__.py
touch backend/app/database/seeds/__init__.py
touch backend/tests/__init__.py
touch backend/tests/unit/__init__.py
touch backend/tests/integration/__init__.py
touch backend/tests/e2e/__init__.py

# Frontend
touch frontend/__init__.py
```

---

## PASSO 4: Atualizar Imports

### Antes (paths antigos)
```python
from backend.main import app
from backend.routers import activities
from backend.models import Activity
```

### Depois (paths novos)
```python
from app.main import app
from app.routers import activities
from app.models import Activity
```

---

## PASSO 5: Mover Documentação

```bash
# Mover documentação existente
mv *.md docs/  # Ou selective: mv DOCKER_SETUP.md docs/
mv PROJECT_STRUCTURE.md docs/guides/
mv API_CLIENT.md docs/api/
mv DEPLOYMENT.md docs/deployment/
```

---

## PASSO 6: Mover Docker & Config

```bash
# Docker
cp docker-compose.yml docker/dev/
cp docker-compose.prod.yml docker/prod/
cp Dockerfile backend/  # Já está lá
cp nginx.conf config/nginx/

# .env files
mv .env docker/dev/.env.dev
mv .env.prod docker/prod/.env.prod
```

---

## PASSO 7: Commit para Git

```bash
git add -A
git commit -m "chore: reorganizar estrutura do projeto com pastas por função"
git push
```

---

## ✅ Checklist Final

- [ ] Todas as pastas criadas
- [ ] __init__.py em diretórios Python
- [ ] Imports atualizados
- [ ] Arquivos movidos para novas pastas
- [ ] Documentação organizada
- [ ] Docker configs movidos
- [ ] .env files organizados
- [ ] Git commit feito
- [ ] `docker-compose up -d` ainda funciona

---

## 🎯 Resultado Final

Depois destes passos, sua estrutura será:

```
app_baby/
├── backend/app/routers/        ← Suas rotas aqui
├── backend/app/models/         ← Seus modelos aqui
├── backend/app/schemas/        ← Validação aqui
├── backend/app/services/       ← Lógica de negócio aqui
├── frontend/src/pages/         ← Suas páginas aqui
├── frontend/src/components/    ← Seus componentes aqui
├── docs/api/                   ← Documentação de API
├── scripts/deployment/         ← Scripts de deploy
└── docker/prod/                ← Config Docker
```

---

**Pronto! Projeto reorganizado profissionalmente!** ✅
