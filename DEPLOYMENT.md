# 🚀 Guia Completo de Deployment para Produção

## Índice
1. [Railway Deployment](#railway)
2. [Digital Ocean Deployment](#digital-ocean)
3. [Domínio Próprio + SSL](#dominio)
4. [FreeLLMAPI em Produção](#freellm)
5. [Monitoramento](#monitoring)

---

# 🚂 Railway Deployment {#railway}

## Pré-requisitos
- Conta no Railway.app (railway.app)
- Repositório GitHub conectado
- Node.js 18+ localmente

## Passo 1: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Autorize e selecione seu repositório: `investirmentos3-hub/free-llm-api`
5. Railway vai detectar automaticamente

## Passo 2: Configurar Backend

```bash
# No dashboard do Railway, criar novo serviço:
# 1. New Service > GitHub Repo
# 2. Selecionar repo
# 3. Railway detecta package.json na raiz
```

### Adicionar Procfile na raiz do backend:

```bash
echo "web: node src/server.js" > backend/Procfile
```

### Variáveis de Ambiente no Railway

No dashboard, ir para o serviço e adicionar variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=gere-uma-chave-segura-com-openssl
API_KEY=sua-api-key-segura
FREELLM_API_URL=https://seu-freellm.railway.app (depois configurar)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DB_PATH=/data/app.db
```

### Gerar JWT_SECRET Seguro

```bash
# No terminal, execute:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`.

## Passo 3: Configurar Frontend

```bash
# Criar arquivo railway.json na raiz do frontend:
```

### frontend/railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview -- --host 0.0.0.0"
  }
}
```

### Variáveis do Frontend

```env
VITE_API_URL=https://seu-backend.railway.app
```

## Passo 4: Deploy Automático

Railway faz deploy automático a cada push no GitHub:

```bash
git add .
git commit -m "chore: prepare for production"
git push origin feature/init-free-llm-api
```

Railway vai:
1. Detectar mudanças
2. Build automático
3. Deploy automático
4. Gerar URLs públicas

## Passo 5: Domínios Railway

No dashboard:
1. Ir para Backend Service
2. Settings > Domain
3. Gerar domínio público
4. Exemplo: `free-llm-backend.railway.app`

Fazer o mesmo para o frontend.

## Passo 6: Conectar Domínio Próprio

Ver seção [Domínio Próprio](#dominio) abaixo.

## ✅ Checklist Railway

- [ ] Projeto criado no Railway
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET gerado
- [ ] Domínios gerados
- [ ] Push para GitHub dispara deploy
- [ ] URLs públicas acessíveis

---

# 🌊 Digital Ocean Deployment {#digital-ocean}

## Pré-requisitos
- Conta no DigitalOcean (digitalocean.com)
- SSH key configurada
- Docker instalado localmente

## Passo 1: Criar Droplet

1. Acesse [DigitalOcean](https://cloud.digitalocean.com)
2. Create > Droplets
3. Escolher:
   - **Imagem**: Ubuntu 22.04 LTS
   - **Tamanho**: $6/mês (Basic - 2GB RAM)
   - **Region**: São Paulo (ou próximo)
   - **SSH Key**: Adicionar sua chave pública

4. Criar droplet
5. Anotar IP: `seu-ip-aqui`

## Passo 2: Conectar ao Droplet

```bash
# SSH para o droplet
ssh root@seu-ip-aqui

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

## Passo 3: Clonar Repositório

```bash
# No droplet:
cd /home
sudo git clone https://github.com/investirmentos3-hub/free-llm-api.git
cd free-llm-api
```

## Passo 4: Configurar Variáveis

```bash
# Backend .env
sudo nano backend/.env
```

Adicionar:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=sua-chave-segura
API_KEY=sua-api-key
FREELLM_API_URL=http://localhost:8000
DB_PATH=/data/app.db
```

## Passo 5: Preparar Docker Compose

### Criar docker-compose.prod.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FREELLM_API_URL=http://freellm:8000
    volumes:
      - ./backend/data:/app/data
    restart: always
    networks:
      - free-llm

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://seu-backend.com
    restart: always
    depends_on:
      - backend
    networks:
      - free-llm

  freellm:
    image: ollama/ollama:latest
    ports:
      - "8000:11434"
    volumes:
      - ./data/models:/root/.ollama
    restart: always
    networks:
      - free-llm
    environment:
      - OLLAMA_NUM_PARALLEL=4

networks:
  free-llm:
    driver: bridge
```

## Passo 6: Deploy com Docker

```bash
# No droplet, na pasta do projeto:
sudo docker-compose -f docker-compose.prod.yml build
sudo docker-compose -f docker-compose.prod.yml up -d

# Verificar status
sudo docker-compose logs -f

# Verificar containers
sudo docker ps
```

## Passo 7: Nginx Reverse Proxy

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar config
sudo nano /etc/nginx/sites-available/free-llm
```

### /etc/nginx/sites-available/free-llm

```nginx
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:80;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # SSL (Certbot fará isso automaticamente)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Segurança
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/free-llm /etc/nginx/sites-enabled/

# Testar config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## ✅ Checklist Digital Ocean

- [ ] Droplet criado
- [ ] Docker instalado
- [ ] Repositório clonado
- [ ] .env configurado
- [ ] Docker Compose build
- [ ] Containers rodando
- [ ] Nginx configurado
- [ ] Certificado SSL (próximo passo)

---

# 🌐 Domínio Próprio + SSL {#dominio}

## Passo 1: Registrar Domínio

Recomendados:
- Namecheap (barato)
- Google Domains
- Hostinger
- GoDaddy

Exemplo: `seu-dominio.com`

## Passo 2: Apontar DNS para Digital Ocean

### No DigitalOcean:

1. Dashboard > Networking > Domains
2. Add Domain
3. Digitar seu domínio: `seu-dominio.com`
4. Selecionar Droplet
5. Digital Ocean fornece 3 nameservers:
   ```
   ns1.digitalocean.com
   ns2.digitalocean.com
   ns3.digitalocean.com
   ```

### No Registrador de Domínio:

1. Ir para Nameservers
2. Substituir nameservers padrão pelos do Digital Ocean
3. Salvar
4. Propagar (até 48 horas, geralmente 15min)

### Verificar Propagação:

```bash
nslookup seu-dominio.com
```

## Passo 3: SSL com Certbot

```bash
# No droplet:
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado (Certbot vai automaticamente configurar Nginx)
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Seguir as instruções:
# 1. Digitar email
# 2. Aceitar termos
# 3. Compartilhar email (opcional)
```

## Passo 4: Renovação Automática SSL

```bash
# Testar renovação
sudo certbot renew --dry-run

# Certbot já configura cron automaticamente
# Verificar:
sudo systemctl status certbot.timer
```

## Passo 5: Testar HTTPS

```bash
# Acessar em navegador:
https://seu-dominio.com

# Deve redirecionar HTTP para HTTPS
# Certificado deve estar válido (cadeado verde)
```

## ✅ Checklist Domínio

- [ ] Domínio registrado
- [ ] Nameservers apontados para Digital Ocean
- [ ] DNS propagou
- [ ] Certbot instalado
- [ ] Certificado SSL gerado
- [ ] HTTPS funcionando
- [ ] Redirecionamento HTTP -> HTTPS
- [ ] Certificado auto-renova

---

# 🤖 FreeLLMAPI em Produção {#freellm}

## Opção 1: Digital Ocean (Recomendado)

### Criar segundo Droplet

1. DigitalOcean > Create > Droplet
2. Ubuntu 22.04 LTS
3. $12/mês (4GB RAM - para modelos maiores)
4. Mesmo datacenter
5. Nome: `free-llm-api`

### Instalar FreeLLMAPI

```bash
# SSH para novo droplet
ssh root@novo-ip-freellm

# Instalar Ollama (alternativa a FreeLLMAPI)
curl https://ollama.ai/install.sh | sh

# Ou usar Docker com Ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 ollama/ollama

# Puxar modelo
docker exec ollama ollama pull llama2

# Ou dentro do container:
ollama pull llama2
```

### Expor via API

```bash
# Criar Docker container com API
docker run -d \
  -v ollama:/root/.ollama \
  -p 8000:11434 \
  -e OLLAMA_HOST=0.0.0.0:11434 \
  ollama/ollama
```

## Opção 2: Hugging Face Spaces (Grátis)

1. Acesse huggingface.co/spaces
2. Create Space
3. Selecionar Docker
4. Usar imagem Ollama
5. Deployar
6. Copiar URL pública

## Opção 3: Railway (Simples)

```bash
# Criar novo projeto Railway
# Add Service > Docker Image
# Selecionar: ollama/ollama
# Configurar variáveis
# Deploy
```

## Opção 4: AWS/GCP (Escala)

Mais complexo, não recomendado para MVP.

## Configurar URL no Backend

```bash
# No .env do backend em produção:
FREELLM_API_URL=https://freellm-seu-dominio.com

# Ou se no mesmo droplet:
FREELLM_API_URL=http://localhost:8000
```

## ✅ Checklist FreeLLMAPI

- [ ] Droplet/Servidor criado
- [ ] Ollama instalado
- [ ] Modelo llama2 baixado
- [ ] API respondendo na porta 8000
- [ ] URL configurada no backend
- [ ] Backend consegue chamar FreeLLMAPI
- [ ] Resposta de chat funcionando

---

# 📊 Monitoramento e Logs {#monitoring}

## Opção 1: Sentry (Recomendado para Erros)

### Passo 1: Criar Conta

1. sentry.io
2. Sign up
3. Create Project
4. Selecionar Node.js

### Passo 2: Instalar no Backend

```bash
cd backend
npm install @sentry/node
```

### Passo 3: Configurar Backend

#### backend/src/server.js

```javascript
import * as Sentry from '@sentry/node';

// No início do arquivo
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Adicionar middleware após criar app
app.use(Sentry.Handlers.requestHandler());

// No final (antes de listen)
app.use(Sentry.Handlers.errorHandler());
```

### Passo 4: Variável de Ambiente

```env
SENTRY_DSN=https://seu-dsn-aqui@sentry.io/seu-projeto-id
```

### Capturar Erros

```javascript
try {
  // seu código
} catch (error) {
  Sentry.captureException(error);
}
```

## Opção 2: Logrocket (Melhor para Frontend)

### Passo 1: Conta

1. logrocket.com
2. Sign up
3. Create Project
4. React

### Passo 2: Instalar

```bash
cd frontend
npm install logrocket
```

### Passo 3: Inicializar

#### frontend/src/main.jsx

```javascript
import LogRocket from 'logrocket';

if (import.meta.env.PROD) {
  LogRocket.init('seu-app-id');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Capturar Erros

```javascript
try {
  // código
} catch (error) {
  LogRocket.captureException(error);
}
```

## Opção 3: Logs no Digital Ocean (Gratuito)

```bash
# Ver logs do container
sudo docker logs -f nome-do-container

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Ver logs do sistema
journalctl -u nginx -f
journalctl -u docker -f
```

## Opção 4: CloudWatch (AWS)

Para quem está na AWS.

## Dashboard de Monitoramento

### Métricas a Monitorar:

1. **Uptime** - Site online?
2. **Tempo de Resposta** - API rápida?
3. **Taxa de Erro** - Quantos erros/dia?
4. **Uso de RAM** - Droplet com memória?
5. **Uso de CPU** - Servidor sobrecarregado?
6. **Usuários Ativos** - Quanto uso?
7. **Requisições/min** - Volume de tráfego?

### Ferramentas de Monitoramento:

- **Uptime**: UptimeRobot (grátis)
- **Performance**: NewRelic
- **Logs**: Datadog
- **Erros**: Sentry
- **Frontend**: Logrocket
- **Servidor**: DigitalOcean monitoring (incluído)

## ✅ Checklist Monitoring

- [ ] Sentry configurado para backend
- [ ] Logrocket configurado para frontend
- [ ] UptimeRobot monitorando site
- [ ] Alertas de erro habilitados
- [ ] Logs sendo capturados
- [ ] Dashboard de monitoramento criado
- [ ] Alertas por email configurados

---

# 📋 Resumo Final: Checklist Completo

## Backend + Frontend
- [ ] Railway deployado e rodando
  OU
- [ ] Digital Ocean deployado com Docker

## Domínio
- [ ] Domínio registrado
- [ ] DNS apontado
- [ ] SSL ativo
- [ ] HTTPS funcionando

## IA (FreeLLMAPI)
- [ ] Ollama rodando
- [ ] Modelo llama2 baixado
- [ ] API respondendo
- [ ] Backend conectado

## Monitoramento
- [ ] Sentry para erros
- [ ] Logrocket para frontend
- [ ] UptimeRobot para uptime
- [ ] Alertas configurados

## Resultado Final

✅ **Site completo em produção:**
```
https://seu-dominio.com
```

✅ **API em produção:**
```
https://seu-dominio.com/api
```

✅ **Chat com IA funcionando**

✅ **Monitoramento ativo**

✅ **SSL/HTTPS seguro**

---

## 🆘 Troubleshooting

Ver arquivo `TROUBLESHOOTING.md` para soluções de problemas comuns.

---

## 📞 Suporte

Se tiver dúvidas:
1. Checar documentação do Railway/DigitalOcean
2. Ver logs: `docker logs -f`
3. Testar endpoints com curl
4. Verificar DNS: `nslookup seu-dominio.com`
