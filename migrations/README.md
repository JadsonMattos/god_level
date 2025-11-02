# 📋 Migrations - God Level Challenge

Este diretório contém todas as migrações do banco de dados para o projeto.

## 📁 Estrutura de Migrations

### Migrations Principais

1. **`001_complete_dashboards_schema.sql`** ⭐ **RECOMENDADO**
   - Migração completa e idempotente
   - Adiciona todos os campos necessários para dashboards
   - Segura para rodar múltiplas vezes
   - Inclui: `is_default`, `share_token`, `is_shared`
   - Cria todos os índices necessários

2. **`add_is_default_to_dashboards.sql`**
   - Adiciona campo `is_default`
   - Idempotente (usa `IF NOT EXISTS`)

3. **`add_sharing_to_dashboards.sql`**
   - Adiciona campos de compartilhamento
   - Idempotente (usa `IF NOT EXISTS`)

### Scripts Auxiliares

- **`apply_all_migrations.sh`**: Script para aplicar todas as migrações de uma vez

## 🚀 Como Aplicar Migrations

### Opção 1: Script Automático (Recomendado)

```bash
# Aplicar todas as migrações automaticamente
./migrations/apply_all_migrations.sh
```

### Opção 2: Manual

```bash
# Aplicar migração completa (recomendado - idempotente)
docker compose exec -T postgres psql -U challenge challenge_db < migrations/001_complete_dashboards_schema.sql

# Ou aplicar migrações individuais
docker compose exec -T postgres psql -U challenge challenge_db < migrations/add_is_default_to_dashboards.sql
docker compose exec -T postgres psql -U challenge challenge_db < migrations/add_sharing_to_dashboards.sql
```

### Opção 3: Durante Setup Inicial

O script `setup.sh` já aplica todas as migrações automaticamente.

## ✅ Schema Completo da Tabela `dashboards`

Após aplicar todas as migrações, a tabela terá:

### Campos:
- `id` - SERIAL PRIMARY KEY
- `name` - VARCHAR(255) NOT NULL
- `description` - TEXT
- `config` - JSONB NOT NULL
- `user_id` - INTEGER
- `is_default` - BOOLEAN DEFAULT false NOT NULL
- `share_token` - VARCHAR(64) UNIQUE
- `is_shared` - BOOLEAN DEFAULT false NOT NULL
- `created_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Índices:
- `dashboards_pkey` (PRIMARY KEY)
- `idx_dashboards_name`
- `idx_dashboards_user_id`
- `idx_dashboards_is_default`
- `idx_dashboards_share_token`
- `idx_dashboards_is_shared`
- `dashboards_share_token_key` (UNIQUE CONSTRAINT)

## 🔍 Verificar Migrations

Para verificar se as migrations foram aplicadas:

```bash
# Ver estrutura da tabela
docker compose exec postgres psql -U challenge challenge_db -c "\d dashboards"

# Verificar campos específicos
docker compose exec postgres psql -U challenge challenge_db -c \
  "SELECT column_name FROM information_schema.columns WHERE table_name = 'dashboards' ORDER BY ordinal_position;"

# Verificar índices
docker compose exec postgres psql -U challenge challenge_db -c \
  "SELECT indexname FROM pg_indexes WHERE tablename = 'dashboards';"
```

## 🛡️ Idempotência

Todas as migrações são **idempotentes**, ou seja:
- ✅ Podem ser executadas múltiplas vezes sem erro
- ✅ Usam `IF NOT EXISTS` ou verificações condicionais
- ✅ Não causam problemas se rodarem novamente

## 📝 Notas

- O `database-schema.sql` principal já inclui todos os campos desde o início (se aplicado primeiro)
- As migrações servem para atualizar bancos existentes
- Use `001_complete_dashboards_schema.sql` para garantir que tudo está presente

## 🔧 Troubleshooting

### Erro: "column already exists"
Isso é normal! As migrações são idempotentes e podem ignorar esse erro.

### Erro: "table does not exist"
Execute primeiro o `database-schema.sql` para criar as tabelas base.

### Verificar se migration foi aplicada
```bash
docker compose exec postgres psql -U challenge challenge_db -c \
  "SELECT column_name FROM information_schema.columns WHERE table_name = 'dashboards' AND column_name = 'is_default';"
```

Se retornar uma linha, a migration foi aplicada.

