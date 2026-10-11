# Guia de Variáveis de Ambiente para Produção

## Backend .env

```env
# Servidor
NODE_ENV=production
PORT=3000

# Segurança
JWT_SECRET=gerar-com-openssl-rand-hex-32
API_KEY=sua-api-key-complexa

# FreeLLMAPI
FREELLM_API_URL=https://seu-freellm.railway.app
FREELLM_DEFAULT_MODEL=llama2

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Banco de Dados
DB_PATH=/data/app.db

# Monitoramento
SENTRY_DSN=https://seu-dsn@sentry.io/seu-id

# Logging
LOG_LEVEL=info
```

## Frontend .env

```env
VITE_API_URL=https://seu-dominio.com/api
VITE_APP_NAME=Free LLM SaaS
VITE_LOGROCKET_ID=seu-app-id
```

## Gerar JWT_SECRET Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Gerar API_KEY Segura

```bash
node -e "console.log('sk_' + require('crypto').randomBytes(24).toString('hex'))"
```

## Railway Environment Variables

No dashboard do Railway, adicionar:

```
JWT_SECRET = (gerar acima)
API_KEY = (gerar acima)
FREELLM_API_URL = (seu FreeLLMAPI)
SENTRY_DSN = (seu Sentry)
```

## Digital Ocean Environment Variables

Em `/root/.env` no droplet:

```bash
export JWT_SECRET="seu-valor"
export API_KEY="seu-valor"
export FREELLM_API_URL="http://localhost:8000"
```

Ou no arquivo `backend/.env`:

```bash
sudo nano backend/.env
```
