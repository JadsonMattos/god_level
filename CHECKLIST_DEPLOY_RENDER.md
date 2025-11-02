# ✅ Checklist Deploy Render - Acompanhamento

Marque conforme você completa cada etapa:

---

## 📋 **PRÉ-REQUISITOS**

- [ ] Conta no Render.com criada
- [ ] Conta no Upstash.com criada (gratuito)
- [ ] Repositório no GitHub atualizado
- [ ] Código commitado e pushed

---

## 🗄️ **ETAPA 1: PostgreSQL Database** (~5 min)

- [ ] Render → New PostgreSQL
- [ ] Name: `godlevel-postgres`
- [ ] Database: `godlevel_db`
- [ ] User: `godlevel_user`
- [ ] Plan: `Free` (ou `Standard` para produção)
- [ ] Database criado e rodando
- [ ] **Copiei a Internal Database URL:**
  ```
  postgresql://...
  ```

---

## 🔴 **ETAPA 2: Redis Upstash** (~3 min)

- [ ] Upstash → Create Database
- [ ] Name: `godlevel-redis`
- [ ] Type: `Regional` (gratuito)
- [ ] Database criado
- [ ] **Copiei o REST URL:**
  ```
  https://...upstash.io
  ```
- [ ] **Copiei o REST Token:**
  ```
  xxxxx...
  ```

---

## ⚙️ **ETAPA 3: Backend Web Service** (~10 min)

### **Configuração Inicial:**
- [ ] Render → New Web Service
- [ ] Conectei repositório GitHub
- [ ] Name: `godlevel-backend`
- [ ] Root Directory: `backend` ⚠️
- [ ] Branch: `main`

### **Build & Deploy:**
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` ⚠️

### **Variáveis de Ambiente:**
- [ ] `DATABASE_URL` = (URL do PostgreSQL) ou conectei via Connections
- [ ] `REDIS_URL` = (URL do Upstash)
- [ ] `SECRET_KEY` = (gerado ou manual)
- [ ] `ENVIRONMENT` = `production`
- [ ] `CORS_ORIGINS` = `https://godlevel-frontend.onrender.com` ⚠️ SEM `/`
- [ ] `RATE_LIMIT_ENABLED` = `true`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`

### **Deploy:**
- [ ] Cliquei em "Create Web Service"
- [ ] Aguardei deploy concluir (3-5 min)
- [ ] Backend está online
- [ ] Testei: `https://godlevel-backend.onrender.com/api/v1/health` ✅
- [ ] Testei: `https://godlevel-backend.onrender.com/docs` ✅

### **URL do Backend:**
```
https://godlevel-backend.onrender.com
```

---

## 🎨 **ETAPA 4: Frontend Static Site** (~8 min)

### **Configuração Inicial:**
- [ ] Render → New Static Site
- [ ] Conectei repositório GitHub
- [ ] Name: `godlevel-frontend`
- [ ] Root Directory: `frontend` ⚠️
- [ ] Branch: `main`

### **Build Settings:**
- [ ] Build Command: `npm ci && npm run build`
- [ ] Publish Directory: `dist`

### **Variáveis de Ambiente:**
- [ ] `VITE_API_URL` = `https://godlevel-backend.onrender.com` ⚠️ SEM `/`
- [ ] `NODE_VERSION` = `18` (opcional)

### **Deploy:**
- [ ] Cliquei em "Create Static Site"
- [ ] Aguardei build concluir (2-3 min)
- [ ] Frontend está online
- [ ] Testei no navegador ✅

### **URL do Frontend:**
```
https://godlevel-frontend.onrender.com
```

---

## ✅ **ETAPA 5: Testes Finais** (~5 min)

- [ ] Acessei o frontend no navegador
- [ ] Console não mostra erros de CORS
- [ ] Login funciona
- [ ] Dashboard carrega dados
- [ ] Gráficos renderizam
- [ ] Builder funciona
- [ ] Filtros funcionam

---

## 📝 **INFORMAÇÕES IMPORTANTES (GUARDAR)**

### **URLs Finais:**
```
Frontend:  https://godlevel-frontend.onrender.com
Backend:   https://godlevel-backend.onrender.com
API Docs:  https://godlevel-backend.onrender.com/docs
Health:    https://godlevel-backend.onrender.com/api/v1/health
```

### **Database URL:**
```
[COLE AQUI A URL DO POSTGRESQL]
```

### **Redis URL:**
```
[COLE AQUI A URL DO UPSTASH]
```

---

## 🆘 **Se algo der errado:**

1. **Backend 502**: Verificar logs, startCommand com `$PORT`
2. **CORS Error**: Verificar `CORS_ORIGINS` sem trailing slash
3. **DB Error**: Conectar database via Connections no Render
4. **Frontend não carrega**: Verificar build logs, confirmar `dist/`
5. **Login falha**: Verificar `VITE_API_URL` no frontend

---

## 🎉 **DEPLOY CONCLUÍDO!**

Data: ___/___/___
Tempo total: ___ minutos

**Projeto online e funcionando!** 🚀

