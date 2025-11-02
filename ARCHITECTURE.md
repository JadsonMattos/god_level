# 🏗️ Arquitetura da Solução - Analytics para Restaurantes

## 📋 Análise dos Requisitos

### Problema Identificado
**Persona**: Maria, dona de 3 restaurantes em São Paulo
- Precisa responder perguntas operacionais críticas sobre seus dados
- Não tem habilidades técnicas
- Não tem time de dados
- Precisa de insights acionáveis rapidamente

### Requisitos Funcionais

#### Core Features
1. **Exploração Livre de Dados**
   - Filtros dinâmicos por dimensões (data, loja, canal, produto, cliente)
   - Agregações flexíveis (soma, média, contagem, mediana, percentis)
   - Group by múltiplos campos
   - Ordenação customizável

2. **Visualizações Intuitivas**
   - Gráficos de linha (tendências temporais)
   - Gráficos de barra (rankings, comparações)
   - Tabelas pivotáveis
   - Heatmaps (horários/dias da semana)
   - Mapas geográficos (delivery)

3. **Métricas Específicas de Restaurante**
   - Faturamento (total, por período, por canal)
   - Ticket médio
   - Produtos mais vendidos
   - Horários de pico
   - Tempo de entrega/preparo
   - Taxa de cancelamento
   - Performance por loja
   - Mix de pagamentos
   - Customizações mais populares

4. **Comparações e Tendências**
   - Comparar períodos (semana vs semana)
   - Anomalias detectadas automaticamente
   - Crescimento/queda por métrica
   - Forecasting básico

5. **Dashboards Personalizados**
   - Criar dashboards sem código
   - Salvar configurações
   - Compartilhar com equipe
   - Layout responsivo (grid)

### Requisitos Não-Funcionais

#### Performance
- Queries < 500ms para dados agregados
- Suporte a 500k vendas sem problema
- Interface fluida e responsiva
- Não mais de 2s para carregamento inicial

#### UX
- Interface para usuário não-técnico
- Feedback visual imediato
- Mobile-friendly básico
- Acessibilidade (WCAG AA básico)

#### Qualidade
- Código bem estruturado e testável
- Documentação clara
- Setup com `docker compose up`
- Vídeo demo (5-10 min)

## 🎯 Arquitetura Proposta

### Stack Tecnológico

#### Backend
- **Linguagem**: Python 3.11+
- **Framework**: FastAPI (APIs REST rápidas, documentação automática)
- **ORM**: SQLAlchemy (modelagem forte, query builder)
- **Database**: PostgreSQL (já fornecido)
- **Cache**: Redis (cache de queries pesadas)
- **Background Jobs**: Celery + Redis (para pre-agregações)
- **Autenticação**: JWT (simples, stateless)

#### Frontend
- **Framework**: React 18+ (componentização, performance)
- **Build Tool**: Vite (dev server rápido)
- **UI Library**: Shadcn/ui + TailwindCSS (componentes modernos, responsivos)
- **Charts**: Recharts (flexível, performático)
- **State**: Zustand (simples, eficiente)
- **Forms**: React Hook Form (validação, UX)
- **Date Picker**: react-day-picker

#### Infra
- **Container**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (servir frontend, proxy API)
- **Monitoring**: Prometheus + Grafana (opcional, extra)

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Dashboard │  │ Explorer │  │ Reports  │  │ Settings │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                          ↓ HTTP/REST                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   API Routes │  │   Services    │  │   Models     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                          ↓                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Query      │  │   Cache      │  │  Background  │     │
│  │   Builder    │  │   Layer      │  │   Jobs       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
        ↓                           ↓                   ↓
┌───────────────┐        ┌───────────────┐    ┌───────────────┐
│  PostgreSQL   │        │    Redis       │    │    Celery     │
│  (Primary DB) │        │   (Cache)      │    │  (Workers)    │
└───────────────┘        └───────────────┘    └───────────────┘
```

### Decisões Arquiteturais

#### 1. Por que FastAPI no Backend?
- **Performance**: Comparável a Node/Go
- **Async**: Suporta operações assíncronas nativamente
- **Type Safety**: Python type hints + Pydantic
- **Documentação**: OpenAPI automático (Swagger UI)
- **Ecosystem**: Fácil integração com Pandas/Numpy para análises

#### 2. Por que React no Frontend?
- **Componentização**: Reuso de componentes de visualização
- **Ecosystem**: Maior ecosistema de libs de charts/UI
- **Performance**: Virtual DOM + React 18 (concurrent features)
- **Developer Experience**: Hot reload, ferramentas maduras

#### 3. Por que Query Builder no Backend?
- **Segurança**: Evita SQL injection
- **Flexibilidade**: Constrói queries dinâmicas sem string concatenation
- **Tipagem**: Type-safe queries com SQLAlchemy
- **Manutenibilidade**: Código mais limpo

#### 4. Por que Cache Layer?
- **Performance**: Queries complexas ficam < 200ms
- **Scale**: Pode escalar até milhões sem refatorar
- **User Experience**: Interface mais responsiva

#### 5. Por que Redis?
- **Simplicidade**: Mais simples que RabbitMQ para este caso
- **Performance**: In-memory, extremamente rápido
- **Dual Purpose**: Cache + Message Broker para Celery

### Estrutura de Diretórios

```
project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Configurações
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── sale.py
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   └── store.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── query.py
│   │   │   ├── response.py
│   │   │   └── dashboard.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py           # Dependencies
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── sales.py      # /api/v1/sales
│   │   │       ├── products.py   # /api/v1/products
│   │   │       ├── customers.py  # /api/v1/customers
│   │   │       └── analytics.py  # /api/v1/analytics
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── query_builder.py  # Build dynamic queries
│   │   │   ├── aggregator.py     # Handle aggregations
│   │   │   ├── cache.py          # Cache management
│   │   │   └── analytics.py      # Business logic
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── session.py        # DB session
│   │   │   └── base.py           # Base models
│   │   └── tasks/                # Celery tasks
│   │       ├── __init__.py
│   │       └── pre_aggregate.py
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_services.py
│   │   └── conftest.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── HeatmapChart.tsx
│   │   │   ├── filters/
│   │   │   │   ├── DateRangePicker.tsx
│   │   │   │   ├── StoreSelector.tsx
│   │   │   │   └── ChannelSelector.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardGrid.tsx
│   │   │   │   ├── DashboardCard.tsx
│   │   │   │   └── DashboardBuilder.tsx
│   │   │   └── ui/                # Shadcn components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Explorer.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useData.ts
│   │   │   └── useFilters.ts
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   ├── store/
│   │   │   └── useDataStore.ts    # Zustand store
│   │   ├── types/
│   │   │   ├── sale.ts
│   │   │   └── analytics.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── tsconfig.json
│
├── docker-compose.yml
├── .env.example
├── README.md
└── ARCHITECTURE.md (este arquivo)
```

## 🎨 UX Design - Persona Maria

### Tela 1: Overview Dashboard
**Objetivo**: Maria vê o estado geral dos negócios rapidamente

**Conteúdo**:
```
┌─────────────────────────────────────────────────────────┐
│  📊 Meu Negócio - Hoje vs Ontem vs Esta Semana         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │   R$ 12k │  │   142    │  │   R$ 84  │  │   98%   ││
│  │Faturament│  │ Vendas   │  │Ticket Méd│  │Ativas   ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
├─────────────────────────────────────────────────────────┤
│  📈 Faturamento (Últimos 30 dias)                      │
│     [Gráfico de linha mostrando tendência]             │
├─────────────────────────────────────────────────────────┤
│  🏆 Top 5 Produtos Hoje                                │
│     1. X-Bacon Duplo: 124 vendas                        │
│     2. Pizza Calabresa: 89 vendas                       │
│     3. Batata Frita G: 67 vendas                        │
│     4. Refrigerante 2L: 45 vendas                       │
│     5. Brownie: 34 vendas                                │
├─────────────────────────────────────────────────────────┤
│  ⚡ Horários de Pico                                    │
│     [Heatmap segunda-domingo x 00h-23h]                 │
└─────────────────────────────────────────────────────────┘
```

### Tela 2: Explorer (Pivot Table)
**Objetivo**: Maria explora dados livremente

**Funcionalidades**:
- Painel de filtros no topo (data, loja, canal, produto, cliente)
- Configurator lateral:
  - Métricas (soma, média, contagem, etc.)
  - Dimensões (agrupar por)
  - Ordenação
- Visualização central (gráfico + tabela)
- Export para CSV/Excel

**Exemplo de Query**:
- "Quero ver faturamento por produto, agrupado por canal, só do iFood, últimos 30 dias"

### Tela 3: Builder de Dashboard
**Objetivo**: Maria cria suas próprias visões

**Interface**:
- Drag-and-drop de widgets
- Cada widget é configurável (tipo de gráfico, dimensões, métricas, filtros)
- Salvar dashboard com nome
- Compartilhar URL

## 🚀 Implementação - Fase a Fase

### Fase 1: Fundação (Sprint 1)
**Objetivo**: Setup completo funcional

**Tasks**:
- [ ] Setup Docker Compose (postgres + backend + frontend + redis)
- [ ] Modelagem SQLAlchemy (todas as tabelas)
- [ ] API básica: `GET /api/v1/sales`
- [ ] Frontend básico: listar vendas
- [ ] CI/CD básico

**Critério de Aceite**: 
- `docker compose up` roda sem erros
- Posso ver lista de vendas no frontend

### Fase 2: Analytics Core (Sprint 2)
**Objetivo**: Queries e agregações fundamentais

**Tasks**:
- [ ] Query Builder service (filtros dinâmicos)
- [ ] Agregações (sum, avg, count, group by)
- [ ] API endpoints:
  - `/api/v1/analytics/revenue`
  - `/api/v1/analytics/products`
  - `/api/v1/analytics/channels`
  - `/api/v1/analytics/times`
- [ ] Frontend: componentes de filtro
- [ ] Primeiro gráfico (gráfico de linha para faturamento)

**Critério de Aceite**:
- Posso filtrar por data e ver faturamento agregado
- Gráfico de linha funciona

### Fase 3: Visualizações (Sprint 3)
**Objetivo**: Dashboards visuais

**Tasks**:
- [ ] Componentes de chart:
  - Line Chart
  - Bar Chart
  - Pie Chart
- [ ] Explorer page completa
- [ ] Métricas pré-definidas:
  - Ticket médio
  - Top produtos
  - Performance por canal
  - Horários de pico
- [ ] Export CSV

**Critério de Aceite**:
- Maria consegue criar um gráfico de "Faturamento por dia"

### Fase 4: Dashboards Personalizados (Sprint 4)
**Objetivo**: Maria cria seus dashboards

**Tasks**:
- [ ] Dashboard Builder (drag-and-drop)
- [ ] Save/load dashboards
- [ ] Layout responsivo (grid system)
- [ ] Compartilhamento (URLs com estado)
- [ ] Heatmap e outros gráficos avançados

**Critério de Aceite**:
- Maria salva um dashboard "Performance Mensal"

### Fase 5: Otimização e Polish (Sprint 5)
**Objetivo**: Performance e UX refinada

**Tasks**:
- [ ] Cache Layer (Redis)
- [ ] Background jobs para pre-agregações
- [ ] Loading states e skeletons
- [ ] Error handling robusto
- [ ] Mobile responsive
- [ ] Testes automatizados
- [ ] Documentação completa
- [ ] Vídeo demo

**Critério de Aceite**:
- Queries < 500ms mesmo com filtros complexos
- Interface fluida

## 📊 Métricas de Sucesso

### Performance
- Query simples (< 10 campos): < 200ms
- Query complexa (joins + agregações): < 500ms
- Page load inicial: < 2s
- Time to interactive: < 3s

### Usabilidade
- Maria consegue ver faturamento em < 30s (sem tutorial)
- Cria dashboard básico em < 5 min
- Export relatório em < 10s

### Qualidade
- Coverage de testes > 60%
- Zero erros críticos no console
- Lighthouse score > 80 (Performance, Accessibility)

## 🧪 Estratégia de Testes

### Backend
- Unit tests: services e modelos
- Integration tests: API endpoints
- Fixtures: dados de teste reais

### Frontend
- Component tests: isolados com React Testing Library
- E2E tests: casos críticos de usuário (Playwright)
- Visual regression: Storybook (opcional)

## 🔐 Segurança

### Autenticação (Simplificada)
- JWT tokens
- Mock login (username/password hardcoded para demo)
- Middleware de auth em rotas protegidas

### API Security
- Rate limiting (opcional)
- CORS configurado
- Input validation com Pydantic
- SQL injection prevention (ORM)

## 📝 Documentação

### Código
- Docstrings em todas as funções públicas
- Type hints completos (Python + TypeScript)
- README com setup passo-a-passo
- API docs via OpenAPI/Swagger

### Decisões
- ADR (Architecture Decision Records) para decisões importantes
- Changelog
- Comentários explicando "why" não apenas "what"

## 🎯 Diferenciais da Solução

### 1. Flexibilidade de Exploração
- Query Builder dinâmico no backend
- Frontend permite criar queries sem código
- Combinação de filtros ilimitada

### 2. Performance Inteligente
- Cache agressivo de queries comuns
- Pre-agregações para métricas frequentes
- Lazy loading de dados

### 3. UX Pensado para Persona
- Linguagem de negócio, não técnica
- Métricas prontas para usar
- Insights automáticos ("Seu faturamento caiu 15%")

### 4. Específico para Restaurantes
- Métricas relevantes (ticket médio, tempo de entrega, horários de pico)
- Visualizações específicas (heatmap de horários, mapa de delivery)
- Insights acionáveis (promoção recomendada, produto estável)

## 🚨 Riscos e Mitigações

### Risco 1: Performance com 500k registros
**Mitigação**:
- Indexes no banco (já criados)
- Cache de queries frequentes
- Paginação sempre que possível
- Limit em queries de listagem

### Risco 2: Complexidade de Query Builder
**Mitigação**:
- Começar simples (soma, média, contagem)
- Suportar casos mais complexos incrementalmente
- Testes com queries reais

### Risco 3: UX confusa para Maria
**Mitigação**:
- User testing com mockups
- Dashboard pré-configurado
- Tooltips e ajuda contextual
- Tutorial/onboarding

### Risco 4: Escopo crescente
**Mitigação**:
- Seguir roadmap fase a fase
- MVP primeiro (ver faturamento, ver top produtos)
- Features extras só se der tempo

## 📅 Timeline Estimada

- **Sprint 1**: 3 dias (Fundação)
- **Sprint 2**: 4 dias (Analytics Core)
- **Sprint 3**: 4 dias (Visualizações)
- **Sprint 4**: 4 dias (Dashboards)
- **Sprint 5**: 3 dias (Otimização + Vídeo)

**Total**: ~18 dias (considerando trabalho em tempo parcial)

## 🎬 Entregáveis Finais

1. **Código**
   - Repositório GitHub
   - Setup funcionando com `docker compose up`
   - Testes passando

2. **Documentação**
   - README claro
   - API docs (Swagger)
   - Arquitetura documentada
   - Decisões de design justificadas

3. **Demo**
   - Vídeo de 5-10 minutos
   - Mostrar solução rodando
   - Explicar abordagem
   - Demonstrar casos de uso de Maria

4. **Extras** (opcional)
   - Deploy em produção (fly.io, railway, etc)
   - Monitoramento (Prometheus/Grafana)
   - Testes E2E

---

**Este documento é vivo. Deve ser atualizado conforme o projeto evolui.**

