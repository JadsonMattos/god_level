# 🐳 Setup Completo com Docker

## 🚀 Opção 1: Docker Completo (Tudo funcionando)

```bash
# 1. Parar qualquer serviço rodando
docker compose down

# 2. Iniciar tudo
docker compose up -d

# 3. Gerar dados (se necessário)
docker compose --profile tools run --rm data-generator

# 4. Acessar aplicação
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## 📋 Serviços Disponíveis

### Serviços Principais
- **frontend** (porta 3000) - React app
- **backend** (porta 8000) - FastAPI
- **postgres** (porta 5432) - Banco de dados
- **redis** (porta 6379) - Cache

### Serviços Auxiliares (com profile:tools)
- **pgadmin** (porta 5050) - Interface de banco
- **data-generator** - Gera dados de teste
- **nginx** (porta 8080) - Reverse proxy (opcional)

---

## 🔧 Comandos Úteis

### Iniciar/Parar
```bash
# Iniciar tudo
docker compose up -d

# Parar tudo
docker compose down

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar um serviço
docker compose restart backend
```

### Limpar e Recomeçar
```bash
# Parar e remover volumes
docker compose down -v

# Rebuild containers
docker compose build --no-cache

# Iniciar novamente
docker compose up -d
```

### Verificar Status
```bash
# Ver containers rodando
docker compose ps

# Ver logs
docker compose logs

# Entrar no container
docker compose exec backend sh
docker compose exec frontend sh
```

---

## 🗄️ Banco de Dados

### Conectar ao PostgreSQL
```bash
# Via Docker
docker compose exec postgres psql -U challenge challenge_db

# Via host
psql -h localhost -U challenge -d challenge_db
```

### Verificar Dados
```bash
# Contar vendas
docker compose exec postgres psql -U challenge challenge_db -c 'SELECT COUNT(*) FROM sales;'

# Ver schema
docker compose exec postgres psql -U challenge challenge_db -c '\dt'
```

---

## 🔨 Desenvolvimento com Docker

### Hot Reload
O Docker Compose já está configurado com volumes para hot reload:

```yaml
volumes:
  - ./backend/app:/app/app  # Backend hot reload
  - ./frontend/src:/app/src  # Frontend hot reload
```

Isso significa que você pode editar os arquivos e ver as mudanças automaticamente!

### Editar Código
```bash
# Editar arquivos localmente
code backend/app/main.py
code frontend/src/App.tsx

# Mudanças aparecem automaticamente nos containers
```

---

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Ver o que está usando a porta
lsof -i :8000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar portas diferentes
# Edite docker-compose.yml
```

### Rebuild necessário
```bash
# Depois de mudanças em Dockerfile
docker compose build --no-cache backend
docker compose up -d --force-recreate backend
```

### Database vazio
```bash
# Regenerar dados
docker compose --profile tools run --rm data-generator
```

### Limpar tudo
```bash
# Remove containers, networks, volumes
docker compose down -v

# Remove imagens
docker compose down --rmi all

# Limpar Docker completamente
docker system prune -a --volumes
```

---

## 📊 Acessando Serviços

| Serviço | URL | Credenciais |
|---------|-----|------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8000 | - |
| API Docs | http://localhost:8000/docs | - |
| PostgreSQL | localhost:5432 | user: challenge, pass: challenge_2024 |
| Redis | localhost:6379 | - |
| pgAdmin | http://localhost:5050 | email: admin@godlevel.com, pass: admin |

---

## 🎯 Comparação: Docker vs Local

### Docker (Recomendado para desenvolvimento)
✅ Tudo configurado automaticamente  
✅ Isolado do sistema  
✅ Fácil de resetar  
✅ Hot reload funcionando  
✅ Sem necessidade de instalar dependências localmente

### Local (Recomendado para debug)
✅ Debug mais fácil  
✅ Mais rápido (sem containers)  
✅ Integração com IDE melhor  
✅ Logs mais limpos

---

## 🚀 Quick Start

```bash
# 1. Clone o repositório (se ainda não tem)
git clone <repo>
cd god_level

# 2. Gere dados
docker compose --profile tools run --rm data-generator

# 3. Inicie tudo
docker compose up

# 4. Acesse
# http://localhost:3000 (frontend)
# http://localhost:8000 (backend)
```

---

## ⚙️ Configuração Avançada

### Variáveis de Ambiente
Edite `docker-compose.yml` para mudar configurações:

```yaml
environment:
  DATABASE_URL: postgresql://challenge:challenge_2024@postgres:5432/challenge_db
  REDIS_URL: redis://redis:6379
  ENVIRONMENT: development
```

### Customizar Portas
Edite as portas em `docker-compose.yml`:

```yaml
ports:
  - "8001:8000"  # Backend em 8001
  - "3001:80"    # Frontend em 3001
```

---

## 🎉 Pronto!

Agora você tem:
- ✅ Frontend rodando em http://localhost:3000
- ✅ Backend rodando em http://localhost:8000
- ✅ Hot reload ativado
- ✅ Banco de dados com 500k+ vendas

**Vantagem**: Tudo isolado em Docker, fácil de resetar e compartilhar! 🚀

