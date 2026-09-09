#!/bin/bash
# Baby John Backend - Setup Script
# Executa setup completo em um único comando

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════╗"
echo "║    Baby John Backend - Setup Automático             ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar Python
echo "1️⃣ Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale: https://www.python.org"
    exit 1
fi
echo "✓ Python3 encontrado: $(python3 --version)"

# 2. Criar virtual environment
echo ""
echo "2️⃣ Criando virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment criado"
else
    echo "✓ Virtual environment já existe"
fi

# 3. Ativar virtual environment
echo ""
echo "3️⃣ Ativando virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment ativado"

# 4. Instalar dependências
echo ""
echo "4️⃣ Instalando dependências..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
echo "✓ Dependências instaladas"

# 5. Verificar PostgreSQL
echo ""
echo "5️⃣ Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️ PostgreSQL não encontrado"
    echo "   Instale: https://www.postgresql.org/download"
    echo "   Depois execute: python init_db.py"
else
    echo "✓ PostgreSQL encontrado"
fi

# 6. Setup .env
echo ""
echo "6️⃣ Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Arquivo .env criado"
    echo "  Edite .env se necessário (default deve funcionar)"
else
    echo "✓ Arquivo .env já existe"
fi

# 7. Criar banco de dados
echo ""
echo "7️⃣ Inicializando banco de dados..."
if python init_db.py; then
    echo "✓ Banco de dados pronto"
else
    echo "⚠️ Erro ao inicializar banco"
    echo "   Verifique se PostgreSQL está rodando"
    echo "   Veja: DATABASE_SETUP.md"
fi

# 8. Validar schema
echo ""
echo "8️⃣ Validando schema..."
python validate_schema.py > /dev/null 2>&1 && echo "✓ Schema válido" || echo "⚠️ Problema no schema"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║           ✨ Setup Completo!                       ║"
echo "╠════════════════════════════════════════════════════╣"
echo "║ Próximo passo:                                     ║"
echo "║   python -m uvicorn main:app --reload             ║"
echo "║                                                    ║"
echo "║ Depois acesse: http://localhost:8000/docs         ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
