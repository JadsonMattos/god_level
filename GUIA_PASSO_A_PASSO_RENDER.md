# 🚀 Guia Passo a Passo: Deploy no Render

## 📋 **Pré-requisitos**

Antes de começar, você precisa ter:
- ✅ Conta no GitHub com o repositório do projeto
- ✅ Conta no Render.com (criar em https://render.com)
- ✅ Conta no Upstash.com (criar em https://upstash.com) - GRATUITO

---

## 📦 **ETAPA 0: Preparação (2 minutos)**

### **0.1. Verificar Repositório no GitHub**
1. Certifique-se de que todo o código está commitado e no GitHub
2. Verifique se o repositório é público (ou conecte via SSH no Render)

### **0.2. Criar Conta no Render**
1. Acesse https://render.com
2. Clique em "Get Started for Free"
3. Conecte com sua conta GitHub (recomendado)

### **0.3. Criar Conta no Upstash (Redis Grátis)**
1. Acesse https://console.upstash.com
2. Clique em "Sign Up"
3. Escolha "Start Free" (plano gratuito)

---

## 🗄️ **ETAPA 1: Deploy do PostgreSQL (5 minutos)**

### **Passo 1.1: Criar Database PostgreSQL**
1. No painel do Render, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `godlevel-postgres` (ou outro nome de sua escolha)
   - **Database**: `godlevel_db`
   - **User**: `godlevel_user`
   - **Region**: Escolha a mais próxima (ex: `Oregon`)
   - **PostgreSQL Version**: `15` ou `16`
   - **Plan**: `Free` (para testes) ou `Standard` (para produção)
3. Clique em **"Create Database"**
4. **Aguarde 2-3 minutos** enquanto o Render cria o banco

### **Passo 1.2: Copiar Database URL**
1. Após criar, clique no database criado
2. Na seção **"Connections"**, copie a **"Internal Database URL"**
   ```
   postgresql://godlevel_user:senha@dpg-xxxxx-a.oregon-postgres.render.com/godlevel_db
   ```
3. **GUARDE ESTA URL!** Você vai precisar depois

### **Passo 1.3: Popular o Banco (Opcional - fazer depois)**
Você pode popular o banco depois de criar o backend, ou usar migrations. Vamos fazer isso depois que o backend estiver rodando.

---

## 🔴 **ETAPA 2: Deploy do Redis no Upstash (3 minutos)**

### **Passo 2.1: Criar Database Redis**
1. Acesse https://console.upstash.com
2. Clique em **"Create Database"**
3. Configure:
   - **Name**: `godlevel-redis`
   - **Type**: `Redis`
   - **Region**: Escolha a mesma região do PostgreSQL (ex: `US West`)
   - **Type**: `Regional` (gratuito)
4. Clique em **"Create"**

### **Passo 2.2: Copiar Redis URL**
1. Após criar, você verá a página do database
2. Na aba **"Details"**, copie:
   - **UPSTASH_REDIS_REST_URL**: `https://xxxxx-xxxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `xxxxx...`
3. **GUARDE ESTAS INFORMAÇÕES!**

### **Passo 2.3: Formatar Redis URL**
O Redis URL deve estar no formato:
```bash
redis://default:TOKEN@HOST:PORT
```
Ou você pode usar apenas:
```bash
REDIS_URL=https://xxxxx-xxxxx.upstash.io
REDIS_TOKEN=xxxxx...
```

---

## ⚙️ **ETAPA 3: Deploy do Backend (10 minutos)**

### **Passo 3.1: Criar Web Service**
1. No painel do Render, clique em **"New +"** → **"Web Service"**
2. Escolha **"Build and deploy from a Git repository"**
3. Conecte seu repositório GitHub:
   - Se não conectou antes: clique em **"Connect account"** e autorize
   - Selecione o repositório: `god_level` (ou o nome do seu repo)

### **Passo 3.2: Configurar o Serviço**
Preencha os campos:

#### **Informações Básicas:**
- **Name**: `godlevel-backend`
- **Region**: Mesma do PostgreSQL (ex: `Oregon`)
- **Branch**: `main` (ou `master`)
- **Root Directory**: `backend` (⚠️ **IMPORTANTE!**)

#### **Build & Deploy:**
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
  ⚠️ **CRÍTICO**: Use `$PORT` (Render injeta automaticamente)

### **Passo 3.3: Adicionar Variáveis de Ambiente**
Clique em **"Advanced"** → **"Add Environment Variable"** e adicione:

#### **Variáveis Obrigatórias:**
```bash
# Database (Render conecta automaticamente se você fizer o link)
DATABASE_URL=postgresql://godlevel_user:senha@dpg-xxxxx-a.oregon-postgres.render.com/godlevel_db

# Redis (URL do Upstash)
REDIS_URL=https://xxxxx-xxxxx.upstash.io
# OU
REDIS_URL=redis://default:TOKEN@HOST:PORT

# Security
SECRET_KEY=coloque-uma-chave-secreta-longa-e-aleatoria-aqui-ou-deixe-o-render-gerar

# Environment
ENVIRONMENT=production

# CORS (ATENÇÃO: sem trailing slash!)
CORS_ORIGINS=https://godlevel-frontend.onrender.com

# Rate Limit
RATE_LIMIT_ENABLED=true
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### **⚠️ DICA: Conectar Database Automaticamente**
1. No final da configuração, antes de clicar em **"Create Web Service"**
2. Na seção **"Connect Database"**, selecione o PostgreSQL criado
3. O Render vai automaticamente adicionar `DATABASE_URL` como variável

### **Passo 3.4: Deploy Manual (Alternativa)**
Se preferir configurar manualmente:
1. Clique em **"Create Web Service"**
2. Após criar, vá em **"Environment"**
3. Adicione todas as variáveis acima manualmente

### **Passo 3.5: Aguardar Deploy**
1. Após criar, o Render começa a fazer o deploy automaticamente
2. Aguarde 3-5 minutos
3. Você verá os logs em tempo real
4. Quando aparecer **"Your service is live"**, está pronto!

### **Passo 3.6: Verificar Backend**
1. Após o deploy, você verá uma URL como:
   ```
   https://godlevel-backend.onrender.com
   ```
2. Teste:
   - Health: `https://godlevel-backend.onrender.com/api/v1/health`
   - Docs: `https://godlevel-backend.onrender.com/docs`
3. Se funcionar, ✅ **Backend está pronto!**

### **Passo 3.7: Popular o Banco de Dados (Agora ou Depois)**
Você tem 2 opções:

#### **Opção A: Usar Migrations via Backend**
1. Após o backend estar rodando, acesse o terminal no Render
2. Ou faça um request para executar migrations
3. Ou popule manualmente via SQL

#### **Opção B: Popular Localmente e Fazer Backup**
1. Execute migrations localmente
2. Gere um backup SQL
3. Restaure no Render PostgreSQL via pgAdmin ou CLI

---

## 🎨 **ETAPA 4: Deploy do Frontend (8 minutos)**

### **Passo 4.1: Criar Static Site**
1. No painel do Render, clique em **"New +"** → **"Static Site"**
2. Conecte o mesmo repositório GitHub

### **Passo 4.2: Configurar Build**
Preencha os campos:

#### **Informações Básicas:**
- **Name**: `godlevel-frontend`
- **Branch**: `main` (ou `master`)
- **Root Directory**: `frontend` ⚠️ **IMPORTANTE!**

#### **Build Settings:**
- **Build Command**: 
  ```bash
  npm ci && npm run build
  ```
- **Publish Directory**: 
  ```
  dist
  ```

### **Passo 4.3: Adicionar Variáveis de Ambiente**
Na seção **"Environment"**, adicione:

```bash
# API URL do Backend (SEM trailing slash!)
VITE_API_URL=https://godlevel-backend.onrender.com

# Node Version (opcional)
NODE_VERSION=18
```

⚠️ **CRÍTICO**: 
- ❌ **ERRADO**: `https://godlevel-backend.onrender.com/`
- ✅ **CORRETO**: `https://godlevel-backend.onrender.com`

### **Passo 4.4: Deploy**
1. Clique em **"Create Static Site"**
2. Aguarde 2-3 minutos
3. O Render vai:
   - Instalar dependências (`npm ci`)
   - Buildar o projeto (`npm run build`)
   - Publicar a pasta `dist/`

### **Passo 4.5: Verificar Frontend**
1. Após o deploy, você terá uma URL como:
   ```
   https://godlevel-frontend.onrender.com
   ```
2. Acesse no navegador
3. ✅ **Frontend está pronto!**

---

## ✅ **ETAPA 5: Verificação e Testes (5 minutos)**

### **Passo 5.1: Testar Conexão Frontend → Backend**
1. Abra o console do navegador (F12)
2. Acesse o frontend
3. Verifique se não há erros de CORS
4. Tente fazer login

### **Passo 5.2: Verificar URLs**
Teste estas URLs:

```
✅ Frontend:     https://godlevel-frontend.onrender.com
✅ Backend:      https://godlevel-backend.onrender.com
✅ API Health:   https://godlevel-backend.onrender.com/api/v1/health
✅ API Docs:     https://godlevel-backend.onrender.com/docs
```

### **Passo 5.3: Testar Funcionalidades**
- [ ] Login funciona
- [ ] Dashboard carrega dados
- [ ] Builder funciona
- [ ] Gráficos renderizam
- [ ] Filtros funcionam

---

## 🔧 **Troubleshooting Comum**

### **❌ Erro: "502 Bad Gateway" no Backend**
**Causa**: Backend não está iniciando corretamente
**Solução**:
1. Verifique os logs do backend no Render
2. Confirme que o `startCommand` está correto:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Verifique se `PORT` está sendo usado (não use 8000 fixo)

### **❌ Erro: "CORS Error" no Frontend**
**Causa**: URL do frontend não está em `CORS_ORIGINS`
**Solução**:
1. Vá em **Backend** → **Environment**
2. Verifique `CORS_ORIGINS`:
   ```
   ✅ CORRETO: https://godlevel-frontend.onrender.com
   ❌ ERRADO:  https://godlevel-frontend.onrender.com/
   ```
3. Remova qualquer trailing slash `/`
4. Faça redeploy do backend

### **❌ Erro: "Database Connection Failed"**
**Causa**: `DATABASE_URL` incorreta ou database não conectado
**Solução**:
1. Vá em **Backend** → **Environment**
2. Verifique `DATABASE_URL`
3. Se não está conectado:
   - Vá em **Backend** → **"Settings"** → **"Connections"**
   - Clique em **"Connect"** no PostgreSQL
   - O Render adiciona automaticamente

### **❌ Erro: "Frontend não carrega"**
**Causa**: Build falhou ou `dist/` não encontrado
**Solução**:
1. Vá em **Frontend** → **"Logs"**
2. Verifique erros de build
3. Confirme:
   - **Root Directory**: `frontend`
   - **Publish Directory**: `dist`
   - **Build Command**: `npm ci && npm run build`

### **❌ Erro: "Login não funciona"**
**Causa**: Frontend não consegue se conectar ao backend
**Solução**:
1. Verifique `VITE_API_URL` no frontend
2. Confirme que o backend está online
3. Teste manualmente:
   ```
   https://godlevel-backend.onrender.com/api/v1/health
   ```

### **❌ Erro: "Backend spins down" (Free Tier)**
**Causa**: Backend gratuito desliga após 15min de inatividade
**Solução**:
- Aguarde ~30 segundos para "wake up"
- Ou upgrade para plano pago (sempre online)

---

## 📊 **Resumo das URLs e Variáveis**

### **URLs Finais:**
```
Frontend:  https://godlevel-frontend.onrender.com
Backend:   https://godlevel-backend.onrender.com
API Docs:  https://godlevel-backend.onrender.com/docs
Health:    https://godlevel-backend.onrender.com/api/v1/health
```

### **Variáveis Backend:**
```bash
DATABASE_URL=postgresql://... (do Render PostgreSQL)
REDIS_URL=https://... (do Upstash)
SECRET_KEY=... (gerado automaticamente)
ENVIRONMENT=production
CORS_ORIGINS=https://godlevel-frontend.onrender.com
RATE_LIMIT_ENABLED=true
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### **Variáveis Frontend:**
```bash
VITE_API_URL=https://godlevel-backend.onrender.com
NODE_VERSION=18
```

---

## 💰 **Custos (Free Tier)**

```
PostgreSQL:  Free (90 dias) ⏰
Redis:        Upstash Free ♾️
Backend:     Free (spins down) ⚠️
Frontend:    Free (sempre online) ✅
───────────────────────────────
TOTAL:       $0/mês
```

---

## 🎉 **Pronto!**

Seu projeto está no ar! 🚀

**Próximos passos**:
- Popular dados no banco
- Configurar domínio customizado (opcional)
- Monitorar logs
- Fazer upgrades quando necessário

**Tempo total**: ~20 minutos

**Dúvidas?** Consulte os logs no Render ou me pergunte!

