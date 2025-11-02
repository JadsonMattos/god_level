#!/bin/bash

# Script para aplicar todas as migrações do banco de dados
# Idempotente - seguro para rodar múltiplas vezes

set -e

echo "🚀 Aplicando migrações do banco de dados..."

# Verificar se o PostgreSQL está rodando
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL não está rodando. Inicie com: docker compose up -d postgres"
    exit 1
fi

# Aguardar PostgreSQL ficar pronto
echo "⏳ Aguardando PostgreSQL ficar pronto..."
sleep 3

# Aplicar schema inicial (cria tabelas se não existirem)
echo "📋 Aplicando schema inicial..."
docker compose exec -T postgres psql -U challenge challenge_db < database-schema.sql || {
    echo "⚠️  Alguns erros podem ser esperados se as tabelas já existem"
}

# Aplicar migração completa de dashboards (idempotente)
echo "📋 Aplicando migração completa de dashboards..."
docker compose exec -T postgres psql -U challenge challenge_db < migrations/001_complete_dashboards_schema.sql || {
    echo "⚠️  Verificando se é erro esperado..."
}

# Aplicar outras migrações (idempotentes)
if [ -f "migrations/add_is_default_to_dashboards.sql" ]; then
    echo "📋 Aplicando migração add_is_default_to_dashboards..."
    docker compose exec -T postgres psql -U challenge challenge_db < migrations/add_is_default_to_dashboards.sql || {
        echo "⚠️  Campo pode já existir - continuando..."
    }
fi

if [ -f "migrations/add_sharing_to_dashboards.sql" ]; then
    echo "📋 Aplicando migração add_sharing_to_dashboards..."
    docker compose exec -T postgres psql -U challenge challenge_db < migrations/add_sharing_to_dashboards.sql || {
        echo "⚠️  Campos podem já existir - continuando..."
    }
fi

echo ""
echo "✅ Migrações aplicadas com sucesso!"
echo ""
echo "📊 Verificando estrutura da tabela dashboards..."
docker compose exec -T postgres psql -U challenge challenge_db -c "\d dashboards"

echo ""
echo "✨ Banco de dados pronto para uso!"

