# 🚀 Comandos Rápidos - God Level Challenge

## ⚡ Início Rápido

### 1️⃣ Verificar se os dados foram gerados
```bash
docker compose exec postgres psql -U challenge challenge_db -c 'SELECT COUNT(*) FROM sales;'
```
**Esperado**: ~503.670

---

## 🔧 Iniciar Aplicação

### Backend (Terminal 1)
```bash
cd /home/jadsonmattos/projects/god_level/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend (Terminal 2)
```bash
cd /home/jadsonmattos/projects/god_level/frontend
npm run dev
```

### Acessar
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

---

## 🧪 Testar API

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### Analytics
```bash
# Summary
curl 'http://localhost:8000/api/v1/analytics/summary?start_date=2024-01-01'

# Revenue
curl 'http://localhost:8000/api/v1/analytics/revenue?start_date=2024-01-01&end_date=2024-06-30'

# Top Products
curl 'http://localhost:8000/api/v1/analytics/products?limit=5'

# Channels
curl 'http://localhost:8000/api/v1/analytics/channels'
```

### Sales
```bash
curl 'http://localhost:8000/api/v1/sales?page=1&size=10'
```

---

## 🐳 Docker

### Iniciar TUDO com Docker (Recomendado)
```bash
# Iniciar todos os serviços
docker compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Iniciar apenas banco e Redis
```bash
docker compose up -d postgres redis
```

### Ver logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Parar tudo
```bash
docker compose down
```

**📖 Para instruções completas**: Veja `DOCKER_SETUP.md`

---

## 📊 Estrutura de Dados

### Ver todas as tabelas
```bash
docker compose exec postgres psql -U challenge challenge_db -c '\dt'
```

### Ver vendas por mês
```bash
docker compose exec postgres psql -U challenge challenge_db -c "
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as sales,
  SUM(total) as revenue
FROM sales
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
"
```

### Ver canais
```bash
docker compose exec postgres psql -U challenge challenge_db -c "
SELECT c.name, COUNT(s.id) as sales
FROM channels c
LEFT JOIN sales s ON c.id = s.channel_id
GROUP BY c.id, c.name
ORDER BY sales DESC;
"
```

---

## 🧹 Limpar e Recriar

### Recriar dados
```bash
# Apagar vendas antigas
docker compose exec postgres psql -U challenge challenge_db -c 'TRUNCATE sales, product_sales CASCADE;'

# Gerar novos dados
docker compose --profile tools run --rm data-generator
```

### Reset completo do banco
```bash
docker compose down -v
docker compose up -d postgres
docker compose --profile tools run --rm data-generator
```

---

## 📝 Estrutura de Arquivos

```
god_level/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints
│   │   ├── models/          # 19 models SQLAlchemy
│   │   ├── services/        # Business logic
│   │   └── schemas/         # Pydantic schemas
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # 3 páginas
│   │   ├── components/      # Charts + Filters
│   │   ├── hooks/          # useSales, useAnalytics
│   │   └── services/       # API client
│   └── package.json
│
└── docker-compose.yml
```

---

## 🎯 Funcionalidades

### ✅ Implementadas
- Dashboard com 4 gráficos
- Página de comparação temporal
- Listagem de vendas
- Export CSV
- Filtros avançados
- 6 endpoints de analytics

### 📋 Páginas

1. **Dashboard** (`/`) - Visão geral com métricas e gráficos
2. **Comparação** (`/comparison`) - Comparar dois períodos
3. **Vendas** (`/sales`) - Lista completa de vendas

---

## 🔍 Debug

### Verificar imports
```bash
cd backend && python -c "from app.models import Sale; print('OK')"
cd frontend && npm run build
```

### Ver variáveis de ambiente
```bash
cat backend/.env
cat frontend/.env
```

### Verificar porta 8000
```bash
lsof -i :8000
```

---

## 📚 Documentação

- `README.md` - Overview
- `FINAL_SUMMARY.md` - Resumo completo
- `COMANDOS_RAPIDOS.md` - Este arquivo
- `PROJECT_RULES.md` - Convenções
- `ARCHITECTURE.md` - Decisões arquiteturais

---

## 🎉 Pronto!

Projeto 70% completo. Funcional para demonstração.

**Próximos passos** (opcional):
- Adicionar cache Redis
- Testes automatizados
- Dashboard builder drag-and-drop

