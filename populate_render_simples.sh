#!/bin/bash

# SOLUÇÃO SIMPLES E RÁPIDA:
# 1. Gera dados LOCALMENTE (Docker local - rápido!)
# 2. Faz backup do banco local
# 3. Restaura backup no Render (muito mais rápido que gerar remotamente)

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     ⚡ MÉTODO RÁPIDO: Local → Backup → Render            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# URLs
RENDER_DB_URL="${RENDER_DB_URL:-postgresql://challenge:foSp04SLYFijEzgfL43RL595BxyREJvV@dpg-d43oac9r0fns73fb7i40-a.oregon-postgres.render.com/challenge_db_kvmd?sslmode=require}"
LOCAL_DB_URL="postgresql://challenge:challenge_2024@localhost:5432/challenge_db"

# Verificar RENDER_DB_URL
if [ -z "$RENDER_DB_URL" ]; then
    echo "❌ ERRO: Configure RENDER_DB_URL"
    echo ""
    echo "   export RENDER_DB_URL='postgresql://user:pass@host/dbname'"
    echo "   ./populate_render_simples.sh"
    exit 1
fi

echo "📋 Render Database: ${RENDER_DB_URL:0:50}..."
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    exit 1
fi

# Verificar se banco local está rodando
if ! docker ps --format '{{.Names}}' | grep -q "godlevel-db"; then
    echo "📦 Iniciando banco local..."
    docker compose up -d postgres
    echo "⏳ Aguardando banco ficar pronto..."
    sleep 5
fi

echo "✅ Banco local rodando"
echo ""

# ============================================
# PASSO 1: Aplicar schema no banco local
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Passo 1/4: Aplicando schema no banco local..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se container está realmente rodando
if ! docker ps --format '{{.Names}}' | grep -q "^godlevel-db$"; then
    echo "❌ Container godlevel-db não está rodando!"
    echo "   Iniciando..."
    docker compose up -d postgres
    echo "⏳ Aguardando banco ficar pronto..."
    sleep 10
fi

# Usar docker exec para aplicar schema diretamente no container
if [ -f "database-schema.sql" ]; then
    echo "📋 Aplicando database-schema.sql..."
    docker exec -i godlevel-db psql -U challenge -d challenge_db < database-schema.sql 2>&1 | grep -v "already exists\|ERROR.*already exists" || true
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "✅ Schema aplicado"
    else
        echo "⚠️  Alguns erros podem ser esperados se tabelas já existem"
    fi
fi

if [ -f "migrations/001_complete_dashboards_schema.sql" ]; then
    echo "📋 Aplicando migrations de dashboards..."
    docker exec -i godlevel-db psql -U challenge -d challenge_db < migrations/001_complete_dashboards_schema.sql 2>&1 | grep -v "already exists\|NOTICE" || true
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "✅ Migrations aplicadas"
    else
        echo "⚠️  Alguns erros podem ser esperados se campos já existem"
    fi
fi

echo ""

# ============================================
# PASSO 2: Popular dados LOCALMENTE
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Passo 2/4: Gerando dados LOCALMENTE (isso é rápido!)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Conectar ao banco local usando network do docker-compose
# Detectar nome da network automaticamente
NETWORK_NAME=$(docker inspect godlevel-db --format '{{range $net, $v := .NetworkSettings.Networks}}{{printf "%s" $net}}{{end}}' 2>/dev/null || echo "analytics-network")

docker run --rm \
    -v "$(pwd):/app" \
    -w /app \
    --network "$NETWORK_NAME" \
    python:3.11 \
    sh -c "
        pip install -q --no-cache-dir psycopg2-binary faker && \
        python generate_data.py --db-url 'postgresql://challenge:challenge_2024@postgres:5432/challenge_db'
    "

if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar dados localmente"
    exit 1
fi

echo ""
echo "✅ Dados gerados localmente!"
echo ""

# ============================================
# PASSO 3: Fazer backup do banco local
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Passo 3/4: Fazendo backup do banco local..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

echo "📦 Criando backup..."
docker exec -t godlevel-db pg_dump \
    -U challenge \
    -d challenge_db \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    > "$BACKUP_FILE" 2> "${BACKUP_FILE}.log"

if [ ! -s "$BACKUP_FILE" ]; then
    echo "❌ Backup está vazio!"
    exit 1
fi

echo "🗜️  Comprimindo backup..."
gzip -f "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo ""
echo "✅ Backup criado: $BACKUP_FILE ($BACKUP_SIZE)"
echo ""

# Limpar log
rm -f "${BACKUP_FILE%.gz}.log"

# ============================================
# PASSO 4: Restaurar backup no Render
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Passo 4/4: Restaurando backup no Render..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚠️  ATENÇÃO: Isso vai substituir todos os dados no Render!"
read -p "Continuar? (s/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 0
fi

# Informações do backup
BACKUP_SIZE_MB=$(gunzip -l "$BACKUP_FILE" 2>/dev/null | tail -1 | awk '{print $2}' | awk '{printf "%.1f", $1/1024/1024}')
UNCOMPRESSED_SIZE_MB=$(gunzip -l "$BACKUP_FILE" 2>/dev/null | tail -1 | awk '{print $1}' | awk '{printf "%.1f", $1/1024/1024}')

echo "📦 Backup: $BACKUP_FILE"
echo "   Tamanho comprimido: ${BACKUP_SIZE_MB} MB"
echo "   Tamanho descomprimido: ${UNCOMPRESSED_SIZE_MB} MB"
echo ""
echo "🔄 Restaurando... (isso pode levar vários minutos para ${UNCOMPRESSED_SIZE_MB} MB)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Descomprimir temporariamente
TEMP_SQL=$(mktemp)
echo "📂 Descomprimindo backup..."
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"
echo "✅ Backup descomprimido"

# Limpar mensagens de log
CLEANED_SQL=$(mktemp)
echo "🧹 Limpando SQL..."
sed -e '/^CREATE ROLE/d' \
    -e '/^ALTER ROLE/d' \
    -e '/^DROP DATABASE/d' \
    -e '/^ALTER DATABASE/d' \
    -e '/^SET ROLE/d' \
    "$TEMP_SQL" > "$CLEANED_SQL"
echo "✅ SQL limpo"
echo ""

# Verificar se pv (pipe viewer) está disponível para mostrar progresso
if command -v pv &> /dev/null; then
    echo "📊 Restaurando com indicador de progresso..."
    echo ""
    # Usar pv para mostrar progresso baseado no tamanho do arquivo
    cat "$CLEANED_SQL" | pv -s "${UNCOMPRESSED_SIZE_MB}M" -p -t -e -r -b | \
        docker run --rm -i postgres:15 bash -c "psql \"$RENDER_DB_URL\" -v ON_ERROR_STOP=1 -v VERBOSITY=terse 2>&1"
else
    echo "📊 Restaurando... (instale 'pv' para ver progresso: sudo apt-get install pv)"
    echo ""
    # Restaurar com verbose e mostrar progresso básico
    echo "📡 Conectando ao Render Postgres com SSL..."
docker run --rm -i postgres:15 \
    env PGPASSWORD="foSp04SLYFijEzgfL43RL595BxyREJvV" \
    psql \
    "host=dpg-d43oac9r0fns73fb7i40-a.oregon-postgres.render.com \
     port=5432 \
     dbname=challenge_db_kvmd \
     user=challenge \
     sslmode=require" < "$CLEANED_SQL" | \
        while IFS= read -r line; do
            # Mostrar comandos importantes (CREATE, ALTER, INSERT, COPY)
            if [[ "$line" =~ ^(CREATE|ALTER|INSERT|COPY|SET|COMMIT) ]]; then
                echo "[$(date +%H:%M:%S)] $line"
            # Mostrar contadores de linhas do COPY
            elif [[ "$line" =~ ^COPY.*[0-9]+ ]]; then
                echo "[$(date +%H:%M:%S)] ✅ $line"
            # Mostrar erros
            elif [[ "$line" =~ ^ERROR: ]]; then
                echo "❌ $line"
            # Mostrar avisos importantes
            elif [[ "$line" =~ ^NOTICE:.*(does not exist|already exists) ]]; then
                echo "ℹ️  $line"
            fi
        done
fi

RESTORE_EXIT=$?

# Limpar temporários
rm -f "$TEMP_SQL" "$CLEANED_SQL"

if [ $RESTORE_EXIT -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║     ✅ RENDER POPULADO COM SUCESSO!                       ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Verificar dados:"
    echo "   curl https://seu-backend.onrender.com/api/v1/analytics/summary"
    echo ""
else
    echo ""
    echo "❌ Erro ao restaurar no Render"
    exit 1
fi

