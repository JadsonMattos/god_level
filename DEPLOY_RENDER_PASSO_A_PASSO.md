# 🚀 Deploy no Render - Guia Passo a Passo Completo

Este guia vai te levar do zero até o projeto 100% online em **~15 minutos**.

---

## 📋 **Pré-requisitos**

Antes de começar, tenha em mãos:
- [x] Conta GitHub com o repositório do projeto
- [x] Conta no Render.com (criar se não tiver)
- [x] 15 minutos disponíveis

---

## 🎯 **PASSO 1: Criar Conta e Preparar**

### 1.1 Criar Conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Faça login com **GitHub** (recomendado)
4. Autorize o Render a acessar seus repositórios

✅ **Pronto!** Agora você está no Dashboard do Render.

---

## 📊 **PASSO 2: Deploy do PostgreSQL (Database)**

### 2.1 Criar o Banco de Dados

1. No Dashboard do Render, clique em **"New +"**
2. Selecione **"PostgreSQL"**
3. Preencha:
   - **Name**: `godlevel-postgres` (ou qualquer nome)
   - **Database**: `godlevel_db`
   - **User**: `godlevel_user`
   - **Region**: Escolha o mais próximo (ex: `Oregon (US West)`)
   - **PostgreSQL Version**: `16` (ou a mais recente)
   - **Plan**: **Free** (para testes) ou **Standard** ($7/mês para produção)

4. Clique em **"Create Database"**
5. ⏳ Aguarde ~2 minutos para criação

### 2.2 Copiar a URL de Conexão

1. Após criação, entre no database
2. Na seção **"Connections"**, copie a **"Internal Database URL"**
   - Formato: `postgresql://usuario:senha@host:porta/nome_db`
3. ⚠️ **GUARDE ESTA URL!** Você vai usar no backend

### 2.3 Popular o Banco (Opcional - se tiver dados)

Se você já tem um backup SQL:

1. No Render Dashboard, vá em **"PostgreSQL"** → seu database
2. Use o **"psql"** via terminal ou:
3. Crie um serviço temporário para rodar scripts SQL

**OU** você pode popular depois via API do backend.

---

## 🔴 **PASSO 3: Setup do Redis (Upstash - Gratuito)**

### 3.1 Criar Conta no Upstash

1. Acesse: **https://console.upstash.com**
2. Faça login com GitHub
3. Clique em **"Create Database"**

### 3.2 Configurar Redis

1. Preencha:
   - **Name**: `godlevel-redis`
   - **Type**: **Regional** (mais barato)
   - **Region**: Escolha próximo ao seu PostgreSQL
   - **Plan**: **Free** (10k requests/dia)

2. Clique em **"Create"**

### 3.3 Copiar Credenciais

1. Após criação, você verá:
   - **UPSTASH_REDIS_REST_URL**: `https://...`
   - **UPSTASH_REDIS_REST_TOKEN**: `token...`

2. ⚠️ **GUARDE AMBOS!**

3. Forme a URL completa para o backend:
   ```
   REDIS_URL=redis://default:TOKEN@HOST:6379
   ```
   
   **OU** use a REST URL do Upstash diretamente:
   ```
   REDIS_URL=https://...@...upstash.io:6379
   ```

---

## ⚙️ **PASSO 4: Deploy do Backend**

### 4.1 Conectar o Repositório

1. No Render Dashboard, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub:
   - Clique em **"Connect GitHub"**
   - Autorize o Render
   - Selecione o repositório: `god_level` (ou seu nome)
   - Clique em **"Connect"**

### 4.2 Configurar o Backend

Preencha os campos:

#### **Basic Settings:**
- **Name**: `godlevel-backend`
- **Region**: Mesmo do PostgreSQL
- **Branch**: `main` (ou `master`)
- **Root Directory**: **deixe em branco** (ou `backend` se estiver na raiz)
- **Runtime**: **Python 3.11** (⚠️ IMPORTANTE: Use 3.11, não 3.13!)
- **Build Command**: 
  ```bash
  cd backend && pip install --upgrade pip && pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

#### **Environment Variables:**

Clique em **"Add Environment Variable"** e adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Cole a **Internal Database URL** do passo 2.2 |
| `REDIS_URL` | Cole a URL do Redis do passo 3.3 |
| `SECRET_KEY` | Gere uma chave segura: `openssl rand -hex 32` ou deixe o Render gerar |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `https://godlevel-frontend.onrender.com` (ajuste depois se mudar o nome) |
| `RATE_LIMIT_ENABLED` | `true` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `PYTHON_VERSION` | `3.11.0` (opcional, força versão específica) |

⚠️ **IMPORTANTE**: No campo **Runtime**, selecione explicitamente **Python 3.11**, não deixe "Python 3" genérico!

#### **Advanced Settings:**
- **Health Check Path**: `/api/v1/health`
- **Auto-Deploy**: `Yes` (deploy automático em push)

### 4.3 Criar o Serviço

1. Clique em **"Create Web Service"**
2. ⏳ Aguarde ~5 minutos para build e deploy
3. ✅ Quando aparecer **"Live"**, seu backend está online!

### 4.4 Verificar o Backend

1. Copie a URL do serviço (ex: `https://godlevel-backend.onrender.com`)
2. Acesse: `https://godlevel-backend.onrender.com/api/v1/health`
3. Deve retornar: `{"status": "healthy"}` ✅
4. Acesse: `https://godlevel-backend.onrender.com/docs`
5. Deve abrir a documentação Swagger ✅

### 4.5 Popular o Banco (Se necessário)

Se precisar popular dados:

1. Use o script `generate_data.py` via terminal local com a URL do Render
2. **OU** crie um script temporário no backend
3. **OU** use migrações SQL via psql

---

## 🎨 **PASSO 5: Deploy do Frontend**

### 5.1 Criar Static Site

1. No Render Dashboard, clique em **"New +"**
2. Selecione **"Static Site"**
3. Conecte o mesmo repositório GitHub
4. Preencha:

#### **Basic Settings:**
- **Name**: `godlevel-frontend`
- **Branch**: `main` (ou `master`)
- **Root Directory**: `frontend`
- **Build Command**: 
  ```bash
  npm ci && npm run build
  ```
- **Publish Directory**: `dist`

#### **Environment Variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://godlevel-backend.onrender.com` (URL do seu backend) |
| `NODE_VERSION` | `18` (ou a versão que você usa) |

⚠️ **IMPORTANTE**: 
- **SEM trailing slash** na URL! ✅ `https://godlevel-backend.onrender.com`
- ❌ NÃO use: `https://godlevel-backend.onrender.com/`

### 5.2 Criar o Site

1. Clique em **"Create Static Site"**
2. ⏳ Aguarde ~3 minutos para build
3. ✅ Quando aparecer **"Live"**, seu frontend está online!

### 5.3 Atualizar CORS no Backend

1. Volte ao serviço **Backend** no Render
2. Vá em **"Environment"**
3. Edite `CORS_ORIGINS` para incluir a URL do frontend:
   ```
   https://godlevel-frontend.onrender.com
   ```
4. Salve (renderiza automaticamente)

---

## ✅ **PASSO 6: Testar Tudo**

### 6.1 Verificar Frontend

1. Acesse a URL do frontend (ex: `https://godlevel-frontend.onrender.com`)
2. Deve carregar a página de login ✅

### 6.2 Testar Login

1. Use as credenciais do sistema:
   - Username: `admin`
   - Password: `admin123`
2. Deve fazer login e carregar o dashboard ✅

### 6.3 Testar Funcionalidades

- [ ] Dashboard carrega dados
- [ ] Filtros funcionam
- [ ] Builder abre e salva dashboards
- [ ] Gráficos renderizam
- [ ] API responde corretamente

---

## 🎯 **URLs Finais**

Após o deploy, você terá:

```
Frontend:  https://godlevel-frontend.onrender.com
Backend:   https://godlevel-backend.onrender.com
API Docs:  https://godlevel-backend.onrender.com/docs
Health:    https://godlevel-backend.onrender.com/api/v1/health
```

---

## 🆘 **Troubleshooting**

### Problema: Erro de Compilação Rust (maturin/cargo)

**Erro típico**:
```
error: failed to create directory `/usr/local/cargo/registry/cache/`
Caused by: Read-only file system (os error 30)
```

**Causa**: Dependências que requerem compilação Rust (ex: `hiredis`, algumas versões de `cryptography`)

**Soluções (faça na ordem)**:

1. ✅ **Remover `hiredis`** (já foi feito no código)
   - `hiredis` é opcional, apenas melhora performance
   - O Redis funciona perfeitamente sem ele

2. ✅ **Usar Python 3.11 no Render** (não 3.13)
   - No campo **Runtime**, escolha explicitamente **Python 3.11**
   - Python 3.13 ainda tem problemas com algumas dependências

3. **Atualizar Build Command** (se necessário):
   ```bash
   cd backend && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
   ```

4. **Se ainda falhar**, adicione estas variáveis de ambiente:
   ```
   CARGO_HOME=/tmp/cargo
   RUSTUP_HOME=/tmp/rustup
   ```

### Problema: 502 Bad Gateway

**Causa**: Backend não está rodando ou erro no código

**Solução**:
1. Vá em **Backend** → **"Logs"**
2. Veja os erros
3. Verifique:
   - ✅ `DATABASE_URL` está correta?
   - ✅ `REDIS_URL` está correta?
   - ✅ Build completou sem erros?

### Problema: CORS Error

**Causa**: URL do frontend não está no CORS_ORIGINS

**Solução**:
1. Verifique se `CORS_ORIGINS` tem a URL **exata** do frontend
2. ⚠️ **SEM trailing slash**: `https://frontend.onrender.com` ✅
3. Refaça deploy do backend após mudar

### Problema: Frontend não carrega dados

**Causa**: `VITE_API_URL` incorreta ou backend offline

**Solução**:
1. Verifique `VITE_API_URL` no frontend (Environment Variables)
2. Teste o backend diretamente: `https://backend.onrender.com/api/v1/health`
3. Veja console do browser (F12) para erros

### Problema: Database Connection Failed

**Causa**: `DATABASE_URL` incorreta ou database não conectado

**Solução**:
1. No Render, vá em **Backend** → **"Settings"**
2. Na seção **"Connections"**, verifique se PostgreSQL está conectado
3. Se não, clique em **"Connect Database"** e selecione seu PostgreSQL
4. Copie a **Internal Database URL** para `DATABASE_URL`

### Problema: Login não funciona

**Causa**: Backend não está acessível ou CORS bloqueando

**Solução**:
1. Verifique se backend está **Live**
2. Teste diretamente: `https://backend.onrender.com/api/v1/auth/login`
3. Veja Network tab no browser (F12) para ver requisições

---

## 💰 **Custos**

### Plano Gratuito (Testes):
- ✅ Frontend: **Sempre grátis** (sempre online)
- ✅ Backend: **Gratuito** (mas "spins down" após 15min inativo)
- ✅ PostgreSQL: **90 dias grátis** depois paga
- ✅ Redis (Upstash): **Gratuito** (10k requests/dia)

### Plano Produção:
- Frontend: **Gratuito** ✅
- Backend: **$7/mês** (sempre online)
- PostgreSQL: **$7/mês** (Standard)
- Redis: **$10/mês** (Upstash Standard)
- **Total**: ~$24/mês

---

## 📝 **Checklist Final**

- [ ] PostgreSQL criado e populado
- [ ] Redis configurado (Upstash)
- [ ] Backend deployado e **Live**
- [ ] Health check funcionando
- [ ] Frontend deployado e **Live**
- [ ] CORS configurado corretamente
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] Builder funcionando
- [ ] URLs anotadas para referência

---

## 🎉 **Pronto!**

Seu projeto está **100% online** e funcionando!

**Próximos passos opcionais**:
- Configurar domínio customizado
- Ativar HTTPS (já vem por padrão)
- Monitorar logs e performance
- Configurar backups automáticos

**Boa sorte! 🚀**

