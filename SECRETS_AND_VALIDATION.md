# 🔑 Guia Completo de Secrets e Validação Final

## 📋 Parte 1: Criar Secrets no GitHub

### Passo 1: Acessar Settings do Repositório

1. Acesse: `github.com/investirmentos3-hub/free-llm-api`
2. Clique em **Settings**
3. Na barra lateral, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret**

### Passo 2: Adicionar Cada Secret

#### Secret 1: RAILWAY_API_TOKEN

**Onde obter:**
1. Acesse [railway.app](https://railway.app)
2. Clique no seu perfil (canto superior direito)
3. Vá para **Account** > **API Tokens**
4. Clique em **Create Token**
5. Copie o token gerado

**No GitHub:**
- Name: `RAILWAY_API_TOKEN`
- Value: `cole o token aqui`

---

#### Secret 2: RAILWAY_PROJECT_ID

**Onde obter:**
1. No Railway, clique em **Projects**
2. Selecione seu projeto Free LLM
3. Clique em **Settings**
4. Copie o **Project ID**

**No GitHub:**
- Name: `RAILWAY_PROJECT_ID`
- Value: `seu-project-id-aqui`

---

#### Secret 3: VERCEL_TOKEN

**Onde obter:**
1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Clique em **Create Token**
3. Defina:
   - Name: `GitHub Actions Deploy`
   - Scope: `Full Account`
   - Expiry: `No Expiration`
4. Copie o token

**No GitHub:**
- Name: `VERCEL_TOKEN`
- Value: `seu-token-vercel-aqui`

---

#### Secret 4: VERCEL_ORG_ID

**Onde obter:**
1. Acesse [vercel.com/account/overview](https://vercel.com/account/overview)
2. Copie o **Team ID** (ou User ID se for pessoal)

**No GitHub:**
- Name: `VERCEL_ORG_ID`
- Value: `seu-org-id-aqui`

---

#### Secret 5: VERCEL_PROJECT_ID

**Onde obter:**
1. No Vercel, vá para seu projeto Free LLM Frontend
2. Clique em **Settings** > **General**
3. Copie o **Project ID**

**No GitHub:**
- Name: `VERCEL_PROJECT_ID`
- Value: `seu-project-id-vercel-aqui`

---

#### Secret 6: RAILWAY_BACKEND_URL (Opcional mas recomendado)

**O que é:**
URL do backend deployado no Railway

**Formato:**
```
https://seu-backend.railway.app
```

**No GitHub:**
- Name: `RAILWAY_BACKEND_URL`
- Value: `https://seu-backend.railway.app`

---

#### Secret 7: SENTRY_DSN (Opcional)

**Onde obter:**
1. Acesse [sentry.io](https://sentry.io)
2. Crie um projeto Node.js
3. Copie o DSN

**Formato:**
```
https://examplePublicKey@o0.ingest.sentry.io/0
```

**No GitHub:**
- Name: `SENTRY_DSN`
- Value: `seu-dsn-aqui`

---

## 🧪 Parte 2: Validação Local Antes de Fazer Push

### Passo 1: Configurar .env Local

**Backend:**
```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-secret-local-123456789
API_KEY=sk_dev_api_key_123456789
FREELLM_API_URL=http://localhost:8000
DB_PATH=./data/app.db
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```

Editar `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:3000
```

### Passo 2: Instalar Dependências

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Passo 3: Rodar Backend Localmente

```bash
cd backend
npm run dev
```

Esperado: `API SaaS rodando em http://localhost:3000`

### Passo 4: Rodar Frontend Localmente (outro terminal)

```bash
cd frontend
npm run dev
```

Esperado: `VITE v5.x.x ready in xxx ms`

### Passo 5: Validar Fluxo Completo

```bash
node scripts/validate.js
```

Esperado:
```
✅ Backend conectado
✅ Registro bem-sucedido
✅ Login bem-sucedido
✅ Autenticação validada
✅ Chat funcionando
✅ Uso carregado
```

### Passo 6: Testar Chat Manualmente

1. Acesse: http://localhost:5173
2. Crie uma conta
3. Faça login
4. Digite uma mensagem
5. Veja a resposta da IA

## 🚀 Parte 3: Fazer Push e Disparar Deploy Automático

### Passo 1: Confirmar Mudanças

```bash
git add .
git commit -m "chore: setup production deployment com GitHub Actions"
```

### Passo 2: Fazer Push

```bash
git push origin feature/init-free-llm-api
```

### Passo 3: Monitorar Deploy

1. Acesse: `github.com/investirmentos3-hub/free-llm-api/actions`
2. Clique no workflow mais recente
3. Veja o progresso em tempo real

Status esperado:
- ✅ Validate
- ✅ Deploy Backend (Railway)
- ✅ Deploy Frontend (Vercel)

### Passo 4: Verificar URLs de Produção

Após deploy bem-sucedido:

**Backend:**
```bash
curl https://seu-backend.railway.app/api/health
```

Esperado: `{"ok":true,"status":"online"}`

**Frontend:**
```bash
curl https://seu-frontend.vercel.app
```

Esperado: `<html>...</html>` (código HTML)

## ✅ Parte 4: Checklist de Validação Final

### Antes de Fazer Push

- [ ] Backend instala sem erros: `cd backend && npm install`
- [ ] Frontend instala sem erros: `cd frontend && npm install`
- [ ] Backend roda: `cd backend && npm run dev`
- [ ] Frontend roda: `cd frontend && npm run dev`
- [ ] `node scripts/validate.js` passa sem erros
- [ ] Registro e login funcionam
- [ ] Chat responde
- [ ] Dashboard mostra uso

### Secrets no GitHub

- [ ] `RAILWAY_API_TOKEN` preenchido
- [ ] `RAILWAY_PROJECT_ID` preenchido
- [ ] `VERCEL_TOKEN` preenchido
- [ ] `VERCEL_ORG_ID` preenchido
- [ ] `VERCEL_PROJECT_ID` preenchido

### Após Fazer Push

- [ ] Workflow disparou no GitHub Actions
- [ ] Build passou sem erros
- [ ] Backend deployou no Railway
- [ ] Frontend deployou no Vercel
- [ ] URLs públicas estão acessíveis
- [ ] Chat funciona em produção

### Pós-Deploy em Produção

- [ ] Domínio configurado no Cloudflare
- [ ] SSL ativo (HTTPS)
- [ ] Sentry capturando erros
- [ ] UptimeRobot monitorando
- [ ] Alertas configurados

## 🔍 Troubleshooting

### Erro: "Cannot find module"

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Erro: "EACCES: permission denied"

```bash
sudo chown -R $USER:$USER backend frontend
```

### Erro: "Port 3000 already in use"

```bash
lsof -i :3000
kill -9 <PID>
```

### Workflow não disparou

1. Verificar se os secrets estão preenchidos
2. Verificar se o branch é `feature/init-free-llm-api`
3. Conferir `.github/workflows/deploy.yml` existe
4. Fazer novo push para disparar

## 📞 Suporte

Se algo der errado:

1. Verificar logs no GitHub Actions
2. Verificar logs no Railway dashboard
3. Verificar logs no Vercel dashboard
4. Rodar `node scripts/validate.js` localmente
5. Chamar `bash scripts/health-check.sh`

---

**Pronto para começar? Siga os passos acima em ordem!** 🚀
