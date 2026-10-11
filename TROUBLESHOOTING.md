# 🔧 Troubleshooting - Problemas Comuns e Soluções

## Railway Issues

### "Build failed"
```bash
# Adicionar build command no railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  }
}
```

### "Cannot find module"
```bash
# Limpar cache Railway
# Dashboard > Service > Settings > Redeploy
```

### Conectar ao banco de dados
```bash
# Railway fornece DATABASE_URL automático
# Usar em .env:
DATABASE_URL=${{DATABASE_URL}}
```

---

## Digital Ocean Issues

### Docker não inicia
```bash
# Verificar status
sudo systemctl status docker

# Reiniciar
sudo systemctl restart docker

# Ver erro
sudo docker logs -f container-id
```

### Porta já em uso
```bash
# Encontrar processo na porta 3000
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID
```

### Falta de espaço em disco
```bash
# Ver uso
df -h

# Limpar Docker
sudo docker system prune -a

# Ver tamanho de pastas
du -sh *
```

### Nginx não responde
```bash
# Testar config
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

---

## DNS Issues

### Domínio não resolve
```bash
# Verificar DNS
nslookup seu-dominio.com

# Esperar propagação (até 48 horas)
# Geralmente demora 15min-2h
```

### NXDOMAIN (domínio não existe)
```bash
# Verifique se os nameservers estão corretos
# No registrador: deve apontar para ns1.digitalocean.com
```

### DNS não aponta para IP correto
```bash
# Adicionar record A no DigitalOcean:
Nome: @
Tipo: A
Valor: seu-ip-do-droplet
```

---

## SSL Issues

### Certificado não renova
```bash
# Testar renovação manual
sudo certbot renew --force-renewal

# Ver logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Erro ao gerar certificado
```bash
# Limpar e tentar novamente
sudo certbot delete --cert-name seu-dominio.com
sudo certbot --nginx -d seu-dominio.com
```

### Port 80/443 não acessíveis
```bash
# Verificar firewall DigitalOcean:
# Dashboard > Networking > Firewalls
# Adicionar regras:
# - HTTP: 80/tcp
# - HTTPS: 443/tcp
```

---

## FreeLLMAPI Issues

### Ollama não responde
```bash
# Verificar se está rodando
docker ps

# Ver logs
docker logs -f ollama-container-id

# Testar conexão
curl http://localhost:11434/api/tags
```

### Modelo não carregou
```bash
# Puxar modelo manualmente
docker exec ollama ollama pull llama2

# Ver modelos disponíveis
docker exec ollama ollama list
```

### Backend não conecta ao FreeLLMAPI
```bash
# Verificar URL no .env
FREELLM_API_URL=http://localhost:8000  # se mesmo droplet
FREELLM_API_URL=http://outro-ip:8000   # se outro droplet

# Testar conexão
curl $FREELLM_API_URL/api/models
```

### Resposta da IA muito lenta
```bash
# Droplet pode ser pequeno
# Aumentar RAM: DigitalOcean > Resize > Plan maior

# Ou usar modelo menor
ollama pull mistral  # mais rápido que llama2
```

---

## Backend Issues

### "Cannot POST /api/chat/chat"
```bash
# Verificar se backend está rodando
curl http://localhost:3000

# Verificar logs
docker logs -f backend-container

# JWT inválido?
curl -H "Authorization: Bearer INVALID" http://localhost:3000/api/user/me
```

### Erro de banco de dados
```bash
# Verificar volume de dados
docker volume ls

# Limpar banco (PERDERÁ DADOS)
rm backend/data/app.db

# Recriar container
docker-compose restart backend
```

### Rate limit atingido
```bash
# Ajustar em .env
RATE_LIMIT_MAX_REQUESTS=1000  # aumentar
RATE_LIMIT_WINDOW_MS=600000   # 10 min
```

---

## Frontend Issues

### "Cannot GET /"
```bash
# Verificar Nginx está respondendo
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Verificar build foi gerado
ls frontend/dist/index.html
```

### Frontend não conecta ao backend
```bash
# Verificar VITE_API_URL
# Deve ser: https://seu-dominio.com/api

# Verificar CORS
# Backend tem CORS habilitado?
# Ver backend/src/server.js: cors()
```

### Página em branco
```bash
# Ver console do navegador (F12)
# Pode ter erro JavaScript

# Rebuild
cd frontend
npm run build

# Limpar cache
# Ctrl+Shift+Delete > limpar tudo
```

---

## Monitoramento Issues

### Sentry não captura erros
```javascript
// Verificar se inicializou
console.log(Sentry.isInitialized());

// Forçar erro de teste
try {
  throw new Error('Test error');
} catch (e) {
  Sentry.captureException(e);
}
```

### Logrocket não registra
```javascript
// Verificar se inicializou
console.log(LogRocket._isEnabled);

// Verificar ID da aplicação
// Deve estar em logrocket.com dashboard
```

### UptimeRobot alertas não funcionam
```bash
# Verificar email de notificação
# Dashboard > Integrations > Verificar email

# Testar manualmente
# Fazer site offline temporariamente
```

---

## Checklist de Diagnóstico

Antes de contatar suporte, executar:

```bash
# 1. Verificar conectividade
ping seu-dominio.com

# 2. Testar HTTPS
curl -I https://seu-dominio.com

# 3. Testar API
curl https://seu-dominio.com/api/health

# 4. Ver logs
sudo docker logs -f backend
sudo docker logs -f frontend

# 5. Verificar portas
sudo netstat -tulpn | grep LISTEN

# 6. Verificar espaco
df -h

# 7. Verificar uptime
uptime

# 8. Ver docker status
sudo docker ps
```

---

## Comandos Úteis

```bash
# Restart de tudo
sudo docker-compose -f docker-compose.prod.yml restart

# Ver logs em tempo real
sudo docker-compose logs -f

# Entrar no container
sudo docker exec -it backend sh

# Limpar dados
sudo docker-compose down
sudo docker volume prune

# Rebuild tudo
sudo docker-compose -f docker-compose.prod.yml build --no-cache
sudo docker-compose -f docker-compose.prod.yml up -d

# Backup banco de dados
sudo cp backend/data/app.db backend/data/app.db.backup

# SSH para droplet
ssh root@seu-ip-droplet

# Transferir arquivo para droplet
scp arquivo.txt root@seu-ip:/home/
```

---

## Contatos de Suporte

- **Railway**: support.railway.app
- **DigitalOcean**: https://support.digitalocean.com
- **Sentry**: sentry.io/support
- **Logrocket**: support@logrocket.com
- **LetsEncrypt**: https://letsencrypt.org/docs/
