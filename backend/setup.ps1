# Baby John Backend - Setup Script (Windows)
# Executa setup completo em um único comando

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Baby John Backend - Setup Automático             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Python
Write-Host "1️⃣ Verificando Python..." -ForegroundColor Yellow
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "❌ Python não encontrado. Instale: https://www.python.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python encontrado: $((python --version) | Out-String)" -ForegroundColor Green

# 2. Criar virtual environment
Write-Host ""
Write-Host "2️⃣ Criando virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✓ Virtual environment criado" -ForegroundColor Green
} else {
    Write-Host "✓ Virtual environment já existe" -ForegroundColor Green
}

# 3. Ativar virtual environment
Write-Host ""
Write-Host "3️⃣ Ativando virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment ativado" -ForegroundColor Green

# 4. Instalar dependências
Write-Host ""
Write-Host "4️⃣ Instalando dependências..." -ForegroundColor Yellow
python -m pip install --upgrade pip | Out-Null
pip install -r requirements.txt | Out-Null
Write-Host "✓ Dependências instaladas" -ForegroundColor Green

# 5. Setup .env
Write-Host ""
Write-Host "5️⃣ Configurando variáveis de ambiente..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Arquivo .env criado" -ForegroundColor Green
    Write-Host "  Edite .env se necessário (default deve funcionar)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Arquivo .env já existe" -ForegroundColor Green
}

# 6. Criar banco de dados
Write-Host ""
Write-Host "6️⃣ Inicializando banco de dados..." -ForegroundColor Yellow
python init_db.py
Write-Host ""

# 7. Validar schema
Write-Host "7️⃣ Validando schema..." -ForegroundColor Yellow
python validate_schema.py
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           ✨ Setup Completo!                       ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║ Próximo passo:                                     ║" -ForegroundColor Cyan
Write-Host "║   python -m uvicorn main:app --reload             ║" -ForegroundColor Yellow
Write-Host "║                                                    ║" -ForegroundColor Cyan
Write-Host "║ Depois acesse: http://localhost:8000/docs         ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
