#!/bin/bash

echo "Verificando geração de dados..."
echo ""

# Verificar processos em execução
if docker compose ps | grep -q "godlevel-data-gen"; then
    echo "✅ Gerador de dados está rodando..."
else
    echo "❌ Gerador de dados não está rodando"
fi

echo ""
echo "Aguardando 5 segundos para checar contagem..."
sleep 5

# Verificar quantidade de vendas
COUNT=$(docker compose exec postgres psql -U challenge challenge_db -t -c 'SELECT COUNT(*) FROM sales;' 2>/dev/null | xargs)

if [ -z "$COUNT" ] || [ "$COUNT" = "0" ]; then
    echo "⏳ Ainda não há dados gerados"
    echo "   Execute: docker compose --profile tools run --rm data-generator"
else
    echo "📊 Vendas no banco: $COUNT"
    echo ""
    echo "✨ Dados gerados com sucesso!"
fi

