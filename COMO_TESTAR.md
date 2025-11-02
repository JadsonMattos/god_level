# 🧪 Como Testar a Aplicação

## Status Atual

✅ PostgreSQL: Rodando com **503,670 vendas**  
✅ Backend: Estrutura criada  
⚠️ Frontend: Estrutura criada, não testado

---

## 🚀 Testes Rápidos

### 1. Verificar Dados no Banco

```bash
# Ver quantas vendas existem
docker compose exec postgres psql -U challenge challenge_db -c 'SELECT COUNT(*) FROM sales;'

# Ver algumas vendas
docker compose exec postgres psql -U challenge challenge_db -c 'SELECT id, total_amount, sale_status_desc FROM sales LIMIT 5;'

# Ver estrutura das tabelas
docker compose exec postgres psql -U challenge challenge_db -c '\d sales'
```

### 2. Testar Backend Manualmente

#### Opção A: Com Docker (Recomendado)
```bash
# Subir backend via Docker (sem Redis)
docker compose up -d backend

# Ou iniciar em foreground para ver logs
docker compose up backend
```

#### Opção B: Manualmente
```bash
cd backend

# Instalar dependências
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar variável de ambiente
export DATABASE_URL="postgresql://challenge:challenge_2024@localhost:5432/challenge_db"

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Testar Endpoints

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Listar vendas
curl http://localhost:8000/api/v1/sales?limit=10

# Com filtros
curl "http://localhost:8000/api/v1/sales?limit=5&store_id=1"
```

### 4. Testar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Acessar: http://localhost:5173
```

---

## 📊 Estrutura dos Dados

### Vendas
```
Total: 503,670 vendas
Período: 6 meses
Lojas: 50
Canais: Múltiplos (presencial, iFood, Rappi, etc.)
```

### Exemplo de Query
```sql
-- Ver 10 vendas mais recentes
SELECT 
    s.id,
    s.created_at,
    s.total_amount,
    s.sale_status_desc,
    st.name as store_name,
    ch.name as channel_name
FROM sales s
JOIN stores st ON st.id = s.store_id
JOIN channels ch ON ch.id = s.channel_id
ORDER BY s.created_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro**: `ModuleNotFoundError: No module named 'app'`
**Solução**: Certifique-se de estar na pasta raiz ao executar uvicorn

```bash
# Correto
cd /home/jadsonmattos/projects/god_level/backend
uvicorn app.main:app --reload

# Errado
uvicorn backend.app.main:app --reload
```

### Porta 8000 já em uso

**Solução**: Usar outra porta
```bash
uvicorn app.main:app --reload --port 8001
```

### Erro de conexão com banco

**Verificar**: PostgreSQL está rodando?
```bash
docker compose ps postgres
```

---

## ✅ Checklist de Teste

- [ ] PostgreSQL rodando
- [ ] 503,670 vendas no banco
- [ ] Backend inicia sem erros
- [ ] Health check retorna OK
- [ ] Endpoint /api/v1/sales retorna dados
- [ ] Frontend instala dependências
- [ ] Frontend inicia sem erros
- [ ] Frontend mostra página de vendas
- [ ] Dados aparecem na tabela

---

## 🎯 Próximo Passo

Depois de testar, vamos para **Sprint 2**:
- Criar dashboard com métricas
- Adicionar gráficos (Recharts)
- Implementar filtros avançados
- Criar visualizações de analytics

---

**Boa sorte nos testes!** 🚀

