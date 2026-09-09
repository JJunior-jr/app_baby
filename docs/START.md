# Baby John Backend - Checklist de Início Rápido

## ✅ Tudo Pronto!

Seu backend PostgreSQL + SQLAlchemy 2.0 está completo e pronto para uso.

## 🚀 Início Rápido (Escolha UMA):

### Opção 1: Script Automático (Recomendado)
```bash
# Linux/macOS
bash setup.sh

# Windows (PowerShell)
./setup.ps1
```

### Opção 2: Manual
```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Criar .env
cp .env.example .env

# 3. Inicializar banco
python init_db.py

# 4. Validar
python validate_schema.py

# 5. Iniciar servidor
python -m uvicorn main:app --reload
```

## 📋 Checklist

- [ ] Instalei dependências (`pip install -r requirements.txt`)
- [ ] PostgreSQL está rodando
- [ ] Executei `python init_db.py`
- [ ] Servidor iniciou com sucesso
- [ ] Acessei http://localhost:8000/docs
- [ ] Fiz login com teste@babyjohn.com / password123

## 🔗 Links Úteis

- **Documentação**: http://localhost:8000/docs (quando servidor rodando)
- **Guia Completo**: Leia `README.md`
- **Setup PostgreSQL**: Veja `DATABASE_SETUP.md`
- **Deploy**: Consulte `DEPLOYMENT.md`

## 🆘 Problemas?

1. Erro de conexão? → `DATABASE_SETUP.md` seção Troubleshooting
2. ModuleNotFoundError? → Reinstale: `pip install -r requirements.txt`
3. "Database does not exist"? → Rode: `python init_db.py`

## ✨ Status

✅ Backend PostgreSQL pronto  
✅ SQLAlchemy 2.0 models  
✅ JWT autenticação  
✅ Rate limiting  
✅ Auditoria  
✅ Documentação completa  

**Próximo passo:** Execute `python init_db.py` ou um dos scripts de setup acima.

---

**Versão:** 1.0.0  
**Data:** 2026-09-09
