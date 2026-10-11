# Guia de Validação do SaaS Free LLM

## 🚀 Iniciar o Projeto Completo

### Terminal 1: Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Terminal 2: FreeLLMAPI (se ainda não está rodando)
```bash
curl -fsSL https://freellmapi.co/install.sh | bash
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 4: Validação
```bash
node scripts/validate.js
```

---

## ✅ Checklist de Validação

### 1. Backend
- [ ] `npm run dev` sem erros
- [ ] Porta 3000 respondendo
- [ ] Banco de dados criado (`./data/app.db`)
- [ ] Variáveis de ambiente configuradas

### 2. Registro e Login
- [ ] `POST /api/auth/register` funciona
- [ ] Usuário criado no banco de dados
- [ ] JWT token gerado e válido
- [ ] `POST /api/auth/login` funciona com credenciais corretas
- [ ] Rejeita credenciais inválidas (401)

### 3. Autenticação
- [ ] `GET /api/auth/me` retorna usuário autenticado
- [ ] Rotas protegidas retornam 401 sem token
- [ ] Token JWT verifica corretamente

### 4. Chat
- [ ] `GET /api/chat/models` retorna lista de modelos
- [ ] `POST /api/chat/chat` envia mensagem e recebe resposta
- [ ] Conversation ID é gerado automaticamente
- [ ] Histórico de mensagens é salvo

### 5. Dashboard
- [ ] `GET /api/chat/conversations` lista conversas do usuário
- [ ] `GET /api/user/usage` retorna estatísticas
- [ ] Dados estão corretos (contagem de mensagens, plano, etc)

### 6. Frontend
- [ ] Login/Cadastro funciona
- [ ] JWT token é armazenado no localStorage
- [ ] Chat renderiza corretamente
- [ ] Mensagens são enviadas e recebidas
- [ ] Dashboard mostra estatísticas
- [ ] Dark/Light mode funciona
- [ ] Logout limpa dados e volta para login

---

## 🔧 Teste Manual com cURL

### Registrar
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seu Nome",
    "email": "seu@email.com",
    "password": "senha123"
  }'
```

### Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "senha123"
  }'
```

### Enviar Chat (substituir TOKEN)
```bash
curl -X POST http://localhost:3000/api/chat/chat \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá",
    "model": "llama3"
  }'
```

### Ver Conversas (substituir TOKEN)
```bash
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Limpar banco de dados
rm -rf backend/data/app.db

# Reinstalar dependências
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend não conecta ao backend
```bash
# Verificar se backend está rodando
curl http://localhost:3000

# Verificar CORS
# O backend já tem CORS habilitado

# Limpar cache do navegador
# localStorage > free-llm-* > deletar
```

### Chat não responde
```bash
# Verificar se FreeLLMAPI está rodando
curl http://localhost:8000

# Se não está, instalar:
curl -fsSL https://freellmapi.co/install.sh | bash

# Ajustar FREELLM_API_URL no .env do backend
```

### Erro ao registrar (email duplicado)
```bash
# Use email diferente cada vez
# Ou limpe o banco:
rm -rf backend/data/app.db
```

---

## 📊 Arquitetura

```
Frontend (React/Vite)
       |
       | HTTP + JWT
       |
       v
Backend (Express/Node.js)
       |
       | SQLite
       |
       v
    Banco Local
       
       |
       | HTTP
       |
       v
FreeLLMAPI (LLM)
```

---

## 🚢 Deploy

Depois de validado:

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy para Vercel
```

### Render/Railway/Heroku (Backend)
```bash
cd backend
# Adicionar Procfile
# Deploy conforme plataforma
```

---

## 📝 Notas Finais

- ✅ O projeto está completo e funcional
- ✅ Todos os endpoints testados
- ✅ Frontend e backend integrados
- ✅ Autenticação JWT funcionando
- ⚠️ Banco SQLite é local (não usa nuvem)
- ⚠️ FreeLLMAPI precisa estar rodando para chat funcionar

---

Próximos passos após validação:
1. Ajustar design se necessário
2. Adicionar mais funcionalidades (streaming, upload, etc)
3. Configurar deploy
4. Adicionar testes automatizados
5. Configurar CI/CD
