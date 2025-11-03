#!/bin/bash

# 🐳 Script de Setup Completo - God Level Challenge
# Este script automatiza todo o processo de setup

set -e  # Para execução em caso de erro

echo "🚀 Iniciando setup completo do projeto..."
echo ""

# 1. Limpar ambiente anterior
echo "📦 Passo 1/7: Limpando ambiente anterior..."
docker compose down -v 2>/dev/null || true
echo "✅ Limpeza concluída"
echo ""

# 2. Build do data-generator
echo "🔨 Passo 2/7: Fazendo build do gerador de dados (sem cache)..."
docker compose build --no-cache data-generator
echo "✅ Build concluído"
echo ""

# 3. Iniciar PostgreSQL
echo "🗄️  Passo 3/7: Iniciando PostgreSQL..."
docker compose up -d postgres
echo "⏳ Aguardando banco ficar pronto..."
sleep 10

# Verificar se banco está pronto
until docker compose exec postgres pg_isready -U challenge -d challenge_db > /dev/null 2>&1; do
  echo "   Aguardando banco..."
  sleep 2
done
echo "✅ PostgreSQL pronto"
echo ""

# 4. Verificar tabelas criadas
echo "📊 Passo 4/7: Verificando tabelas criadas..."
TABLE_COUNT=$(docker compose exec -T postgres psql -U challenge challenge_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
echo "   Tabelas encontradas: $TABLE_COUNT"
if [ "$TABLE_COUNT" -lt "10" ]; then
  echo "⚠️  Poucas tabelas encontradas. Executando schema manualmente..."
  docker compose exec -T postgres psql -U challenge challenge_db < database-schema.sql
fi
echo "✅ Tabelas verificadas"
echo ""

# 5. Gerar dados
echo "📈 Passo 5/7: Gerando dados (500k+ vendas)..."
echo "   Isso pode levar alguns minutos..."
docker compose --profile tools run --rm data-generator || docker compose run --rm data-generator
echo "✅ Dados gerados"
echo ""

# 6. Executar migrations
echo "🔄 Passo 6/7: Executando migrations..."
echo "   Aplicando migração completa de dashboards (idempotente)..."
if [ -f "migrations/001_complete_dashboards_schema.sql" ]; then
  docker compose exec -T postgres psql -U challenge challenge_db < migrations/001_complete_dashboards_schema.sql || {
    echo "   ⚠️  Alguns campos podem já existir (isso é normal)"
  }
fi

# Aplicar outras migrações específicas (idempotentes)
if [ -f "migrations/add_is_default_to_dashboards.sql" ]; then
  docker compose exec -T postgres psql -U challenge challenge_db < migrations/add_is_default_to_dashboards.sql || {
    echo "   ⚠️  Campo is_default pode já existir (isso é normal)"
  }
fi

if [ -f "migrations/add_sharing_to_dashboards.sql" ]; then
  docker compose exec -T postgres psql -U challenge challenge_db < migrations/add_sharing_to_dashboards.sql || {
    echo "   ⚠️  Campos de compartilhamento podem já existir (isso é normal)"
  }
fi
echo "✅ Migrations aplicadas"
echo ""

# 7. Verificar dados
echo "🔍 Passo 7/7: Verificando dados gerados..."
SALES_COUNT=$(docker compose exec -T postgres psql -U challenge challenge_db -t -c 'SELECT COUNT(*) FROM sales;' | xargs)
echo "   Vendas no banco: $SALES_COUNT"

if [ -z "$SALES_COUNT" ] || [ "$SALES_COUNT" = "0" ]; then
  echo "❌ Nenhuma venda encontrada. Execute novamente:"
  echo "   docker compose --profile tools run --rm data-generator"
else
  echo "✅ Dados verificados ($SALES_COUNT vendas)"
fi
echo ""

# 8. Iniciar outros serviços
echo "🚀 Iniciando backend e frontend..."
docker compose up -d backend frontend redis

# 9. Opcional: pgAdmin
read -p "📊 Deseja iniciar pgAdmin? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  docker compose --profile tools up -d pgadmin
  echo "✅ pgAdmin iniciado em http://localhost:5050"
fi
echo ""

# Resumo final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Serviços disponíveis:"
echo "   • Frontend:  http://localhost:3001"
echo "   • Backend:   http://localhost:8001"
echo "   • API Docs:  http://localhost:8001/docs"
if docker compose ps | grep -q "godlevel-pgadmin"; then
  echo "   • pgAdmin:   http://localhost:5050"
  echo "                (Email: admin@godlevel.com, Senha: admin)"
fi
echo ""
echo "🗄️  Banco de dados:"
echo "   • Host:      localhost:5432"
echo "   • Database:  challenge_db"
echo "   • User:      challenge"
echo "   • Password:  challenge_2024"
echo ""
echo "📊 Dados:"
echo "   • Vendas:    $SALES_COUNT"
echo ""
echo "🎉 Tudo pronto! Bom desenvolvimento!"
echo ""

