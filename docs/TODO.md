# 📋 Lista de Tarefas - Próximas Etapas

## ✅ Fase 1: Implementação Concluída
- [x] Database layer com PostgreSQL
- [x] SQLAlchemy 2.0 models
- [x] CRUD operations
- [x] JWT authentication
- [x] Rate limiting
- [x] Auditoria
- [x] Documentação

## 🚀 Fase 2: Validação e Testes

### Antes de usar em produção:
- [ ] Executar `python init_db.py` para criar banco
- [ ] Executar `python validate_schema.py` para validar schema
- [ ] Executar `python test_api.py` para testar endpoints
- [ ] Verificar logs de erro: `tail -f *.log`

### Testes de segurança:
- [ ] Testar SQL injection (veja DATABASE_SETUP.md)
- [ ] Testar rate limiting com múltiplas requests
- [ ] Testar JWT expiration
- [ ] Verificar ownership checks (user só vê seus dados)

### Performance:
- [ ] Executar load test (curl com loop)
- [ ] Monitorar uso de conexões
- [ ] Verificar query times com DATABASE_ECHO=true

## 🔧 Fase 3: Integração com Frontend

### Conectar seu frontend:
1. [ ] Apontar API base para `http://localhost:8000` (dev)
2. [ ] Implementar login e armazenar token JWT
3. [ ] Adicionar token em Authorization headers
4. [ ] Testar endpoints com Swagger UI (/docs)

### Endpoints para integrar:
```
POST   /api/auth/register          - Registrar
POST   /api/auth/login             - Login
GET    /api/auth/me                - Dados do usuário
PUT    /api/auth/me                - Atualizar perfil

POST   /api/activities             - Criar atividade
GET    /api/activities             - Listar atividades
GET    /api/activities/{id}        - Detalhar
PUT    /api/activities/{id}        - Atualizar
DELETE /api/activities/{id}        - Deletar
GET    /api/activities/daily-summary/{date}  - Resumo
```

## 🐳 Fase 4: Deployment

### Docker (opcional):
- [ ] Testar `docker build` com Dockerfile
- [ ] Testar `docker run` com variáveis
- [ ] Push para Docker Hub

### Production:
- [ ] Seguir guia em DEPLOYMENT.md
- [ ] Configurar PostgreSQL em servidor
- [ ] Configurar Gunicorn + Nginx
- [ ] Configurar SSL/TLS com Let's Encrypt
- [ ] Setup backups automáticos

## 📊 Fase 5: Monitoramento

- [ ] Configurar logging centralizado
- [ ] Setup de alertas
- [ ] Monitorar performance
- [ ] Verificar auditoria logs

## 🎯 Checklist Rápido Inicial

```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Setup PostgreSQL (ver DATABASE_SETUP.md)
# 3. Copiar .env
cp .env.example .env

# 4. Inicializar banco
python init_db.py

# 5. Validar
python validate_schema.py

# 6. Iniciar servidor
python -m uvicorn main:app --reload

# 7. Testar endpoints
python test_api.py

# 8. Acessar documentação
# http://localhost:8000/docs
```

## 📞 Se algo der errado

### Debug mode
```bash
python -m uvicorn main:app --reload --log-level debug
```

### Verificar logs
```bash
tail -f *.log
python -c "from validate_schema import check_database_schema; check_database_schema()"
```

### Database issues
- Ver DATABASE_SETUP.md seção Troubleshooting
- Executar `python init_db.py` novamente
- Verificar credenciais em .env

### Connection refused
- Verificar se PostgreSQL está rodando
- Verificar DATABASE_URL em .env
- Ver DATABASE_SETUP.md para restart PostgreSQL

---

**Status**: ✅ Pronto para fase 2 (Validação)  
**Próximo passo**: Executar `python init_db.py`
