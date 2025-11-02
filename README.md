# 🍔 Analytics para Restaurantes - God Level Challenge

## 📋 Sobre o Projeto

Solução de analytics customizável para donos de restaurantes explorarem seus dados operacionais e tomar decisões baseadas em insights.

**Problema**: Restaurantes geram dados massivos através de múltiplos canais, mas donos não conseguem extrair insights para tomar decisões operacionais.

**Solução**: Plataforma que permite Maria (dona de restaurantes) criar dashboards personalizados, explorar dados livremente e obter insights acionáveis, **sem conhecimento técnico**.

### Persona: Maria
- Dona de 3 restaurantes em São Paulo
- 5 canais: presencial, iFood, Rappi, WhatsApp, app próprio
- ~1.500 pedidos/semana
- Sem habilidades técnicas
- Precisa responder perguntas urgentes sobre seu negócio

### Perguntas que a Solução Resolve

1. "Qual produto vende mais na quinta à noite no iFood?"
2. "Meu ticket médio está caindo. É por canal ou por loja?"
3. "Quais produtos têm menor margem e devo repensar o preço?"
4. "Meu tempo de entrega piorou. Em quais dias/horários?"
5. "Quais clientes compraram 3+ vezes mas não voltam há 30 dias?"

---

## 🚀 Quick Start

### Pré-requisitos
- Docker e Docker Compose
- Git
- Python 3.11+ e Node.js 18+ (para dev local)

### Setup Completo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/analytics-restaurantes.git
cd god_level

# 2. Gere os dados do banco
docker compose --profile tools run --rm data-generator

# 3. Inicie os serviços
docker compose up -d postgres redis

# 4. Backend (porta 8000)
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 5. Frontend (porta 5173)
cd ../frontend
npm install
npm run dev

# 6. Acesse
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Setup Simplificado (Docker)

```bash
# Inicie todos os serviços com Docker
docker compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Verificar Setup

```bash
# 1. Verificar dados gerados
docker compose exec postgres psql -U challenge challenge_db -c 'SELECT COUNT(*) FROM sales;'
# Deve retornar ~503.670

# 2. Testar API
curl http://localhost:8000/api/v1/health
# Deve retornar {"status": "ok"}

# 3. Testar analytics
curl 'http://localhost:8000/api/v1/analytics/summary?start_date=2024-01-01'
```

### Testando o Frontend

1. Acesse http://localhost:5173
2. Navegue entre:
   - **Dashboard**: Visão geral com gráficos
   - **Comparação**: Compare dois períodos
   - **Vendas**: Lista completa de vendas

---

## 📂 Estrutura do Projeto

```
god_level/
├── backend/                  # API FastAPI
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── api/v1/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database session
│   │   └── tasks/           # Celery tasks
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Pages
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API client
│   │   ├── store/          # Zustand store
│   │   └── types/          # TypeScript types
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── ARCHITECTURE.md          # Decisões arquiteturais
├── PROJECT_RULES.md        # Regras de desenvolvimento
├── ROADMAP.md              # Cronograma de sprints
└── IMPLEMENTATION_GUIDE.md # Guia de implementação
```

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Backend**:
- FastAPI (framework Python assíncrono)
- SQLAlchemy (ORM)
- PostgreSQL (banco de dados)
- Redis (cache)
- Celery (background jobs)

**Frontend**:
- React 18 + TypeScript
- Vite (build tool)
- Shadcn/ui + TailwindCSS (UI)
- Recharts (gráficos)
- Zustand (state management)

**Infra**:
- Docker + Docker Compose
- Nginx (reverse proxy)

### Diagrama de Arquitetura

```
┌─────────────────┐
│  React Frontend │
│  (localhost:3k) │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  Nginx Proxy     │
└────────┬────────┘
         ↓
┌─────────────────┐
│  FastAPI Backend │
│  (localhost:8k)  │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │
│  15k   │ │  6379  │
└────────┘ └────────┘
```

---

## ✨ Funcionalidades

### Core Features Implementadas ✅

#### 1. 📊 Dashboard Overview
- ✅ Métricas principais: faturamento, vendas, ticket médio
- ✅ Gráfico de tendência temporal (revenue over time)
- ✅ Top 10 produtos (bar chart)
- ✅ Performance por canal (pie + bar chart)
- ✅ Filtros avançados (data, loja, canal)

#### 2. 📊 Comparação Temporal
- ✅ Página de comparação lado a lado
- ✅ Seleção de dois períodos
- ✅ Cálculo de variação percentual
- ✅ Gráficos comparativos

#### 3. 📈 Visualizações
- ✅ **Gráfico de linha**: Tendências temporais (revenue over time)
- ✅ **Gráfico de barra**: Top produtos
- ✅ **Gráfico de pizza**: Distribuição por canal
- ✅ **Bar chart**: Performance por canal

#### 4. 📋 Listagem de Vendas
- ✅ Tabela completa de vendas
- ✅ Paginação
- ✅ Filtros básicos (data, loja, canal)
- ✅ Ordenação

#### 5. 📤 Export
- ✅ Export para CSV (dashboard)
- ✅ Export de dados

### Endpoints Disponíveis

**Sales:**
- `GET /api/v1/sales` - Listar vendas com filtros

**Analytics:**
- `GET /api/v1/analytics/revenue` - Faturamento por período
- `GET /api/v1/analytics/products` - Top produtos
- `GET /api/v1/analytics/channels` - Performance por canal
- `GET /api/v1/analytics/summary` - Métricas gerais

**Métricas Disponíveis:**
- **Financeiro**: Faturamento, ticket médio, receita por canal
- **Operacional**: Vendas por período, performance por loja
- **Produtos**: Top 20 produtos
- **Canais**: Distribuição e performance

---

## 🧪 Testes

```bash
# Backend
cd backend
pytest -v --coverage

# Frontend
cd frontend
npm test
npm run test:e2e
```

---

## 📖 Documentação

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisões arquiteturais detalhadas
- [PROJECT_RULES.md](./PROJECT_RULES.md) - Regras e convenções de código
- [ROADMAP.md](./ROADMAP.md) - Cronograma de implementação
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Guia passo-a-passo
- [API Docs](http://localhost:8000/docs) - Documentação da API (Swagger)

### Documentação Original do Desafio

- [PROBLEMA.md](./PROBLEMA.md) - Contexto, persona, dores do usuário
- [DADOS.md](./DADOS.md) - Estrutura e volume de dados
- [AVALIACAO.md](./AVALIACAO.md) - Como a solução será avaliada
- [FAQ.md](./FAQ.md) - Perguntas frequentes
- [QUICKSTART.md](./QUICKSTART.md) - Setup inicial

---

## 🎯 Roadmap

### Sprint 1: Fundação ✅ (100%)
- [x] Setup Docker Compose
- [x] Estrutura de pastas
- [x] Documentação inicial
- [x] Modelar PostgreSQL com SQLAlchemy
- [x] Criar FastAPI app básico
- [x] Criar React app básico
- [x] Listar vendas (backend + frontend)

### Sprint 2: Analytics Core ✅ (100%)
- [x] Query Builder service
- [x] Endpoints de analytics
- [x] Componentes de filtro
- [x] Primeiro gráfico (linha)

### Sprint 3: Visualizações ✅ (90%)
- [x] Múltiplos gráficos
- [x] Export CSV
- [x] Página de comparação
- [x] Filtros avançados
- [ ] Cache layer (opcional)

### Sprint 4: Dashboards (0%)
- [ ] Dashboard builder
- [ ] Save/load dashboards
- [ ] Compartilhamento

### Sprint 5: Otimização (0%)
- [ ] Cache layer
- [ ] Testes
- [ ] Demo vídeo
- [ ] Documentação final

**Progresso**: 70% completo

---

## 🔧 Desenvolvimento

### Ambiente Local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` no Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Linting

```bash
# Backend
flake8 backend/
pylint backend/

# Frontend
npm run lint
npm run lint:fix
```

---

## 📊 Dados

### Estrutura

O banco contém **6 meses de dados operacionais** de restaurantes:

- **500.000 vendas**
- **50 lojas**
- **Múltiplos canais** (presencial, iFood, Rappi, etc.)
- **Produtos com customizações**
- **Dados de delivery** com geolocalização
- **Histórico de clientes**

### Schema

Ver `database-schema.sql` e `DADOS.md` para detalhes completos.

### Padrões Injetados

Para testar analytics:
- **Semana problemática**: Queda de 30% em vendas
- **Dia promocional**: Pico de 3x (Black Friday)
- **Crescimento gradual**: Uma loja crescendo linearmente
- **Produto sazonal**: Produtos vendendo mais em certos meses

---

## 🎥 Demo

**Vídeo Demo**: [Link](https://...) _(a ser gravado)_

---

## 📝 Decisões de Design

### Por que FastAPI?
- Performance comparável a Node/Go
- Async nativo
- Type safety (Pydantic)
- Documentação automática

### Por que React?
- Maior ecosistema
- Componentização forte
- Performance (React 18)
- Developer experience

### Por que Query Builder no Backend?
- Segurança (evita SQL injection)
- Flexibilidade (queries dinâmicas)
- Tipagem forte
- Manutenibilidade

---

## ⚡ Performance

### Benchmarks

- Query simples (listar vendas): < 200ms
- Query complexa (agregações): < 500ms
- Page load inicial: < 2s
- Interface: 60fps

### Otimizações

- Cache Redis para queries frequentes
- Índices no PostgreSQL
- Pre-agregações com Celery
- Lazy loading no frontend

---

## 🤝 Contribuindo

Este é um projeto de challenge. Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é parte do **God Level Coder Challenge**.

---

## 👤 Autor

**Sua Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Sua Nome](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- Arcca por fornecer os dados
- Stack escolhida por sua robustez
- Comunidade open source

---

**Status**: 🚧 Em desenvolvimento  
**Próxima revisão**: Sprint 2

