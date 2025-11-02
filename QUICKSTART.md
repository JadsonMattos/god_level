# ⚡ Quick Start Manual - Primeira Vez

Guia rápido de comandos para setup manual (sem `setup.sh`).

---

## 🚀 Comandos Rápidos (Copy & Paste)

```bash
# 1. Build do data-generator
docker compose build --no-cache data-generator

# 2. Iniciar PostgreSQL
docker compose up -d postgres
sleep 10

# 3. Criar todas as tabelas (inclui dashboards completo)
docker compose exec -T postgres psql -U challenge challenge_db < database-schema.sql

# 4. Aplicar migrations (garantia extra - idempotente)
docker compose exec -T postgres psql -U challenge challenge_db < migrations/001_complete_dashboards_schema.sql

# 5. Gerar dados
docker compose --profile tools run --rm data-generator

# 6. Iniciar serviços
docker compose up -d backend frontend redis
```

---

## ✅ Verificação Rápida

```bash
# Verificar estrutura da tabela dashboards
docker compose exec postgres psql -U challenge challenge_db -c "\d dashboards"

# Verificar dados gerados
docker compose exec postgres psql -U challenge challenge_db -c "SELECT COUNT(*) FROM sales;"

# Verificar serviços
docker compose ps
```

---

## 📍 Acessar Aplicação

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

---

## 📚 Documentação Completa

Para explicações detalhadas, veja: [SETUP_MANUAL_PRIMEIRA_VEZ.md](./SETUP_MANUAL_PRIMEIRA_VEZ.md)

