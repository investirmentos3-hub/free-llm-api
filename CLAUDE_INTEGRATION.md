# 🤖 Integração com Claude / Anthropic API

## Parte 1: O Que Você Pode Fazer com Claude

### Opção 1: Claude Lê Seu Repositório

Você pode compartilhar seu repositório com Claude e ele:
- Revisa o código
- Sugere melhorias
- Corrige bugs
- Explica a arquitetura
- Ajuda com debugging

### Opção 2: Claude Acessa via API

Você pode criar uma integração onde Claude:
- Lê o status do deploy
- Recebe alertas de erro
- Sugere correções automáticas
- Gera relatórios

### Opção 3: Claude Executa Tasks

Você pode criar prompts para Claude:
- Fazer code review
- Gerar documentação
- Criar testes
- Otimizar performance

## Parte 2: Integração Recomendada

### Setup para Este Projeto

#### A) Adicionar Contexto do Projeto ao Claude

**Crie um arquivo de contexto:**

```bash
cat > PROJECT_CONTEXT.md << 'EOF'
# Free LLM SaaS - Contexto do Projeto

## Stack
- Frontend: React + Vite
- Backend: Express.js + Node.js
- Database: SQLite
- IA: Ollama/Llama2
- Deploy: Railway + Vercel + DigitalOcean

## Arquitetura
- `/backend` - API Express
- `/frontend` - React Vite
- `/scripts` - Automações
- `.github/workflows` - CI/CD

## Endpoints Principais
- POST /api/auth/register
- POST /api/auth/login
- POST /api/chat/chat
- GET /api/user/usage
- GET /api/chat/conversations

## Como Executar Localmente
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Deploy
Automático via GitHub Actions ao fazer push.

## Problemas Conhecidos
- Chat lento se IA não estiver otimizada
- Rate limiting pode afetar usuários ativos
EOF
```

#### B) Criar Arquivo de Instruções para Claude

```bash
cat > CLAUDE_INSTRUCTIONS.md << 'EOF'
# Instruções para Claude Trabalhar com Este Projeto

## Tarefas Que Você Pode Me Ajudar

### 1. Code Review
"Por favor, revise o arquivo [arquivo] e identifique possíveis melhorias."

### 2. Debugging
"Recebi este erro: [erro]. Como posso corrigir?"

### 3. Feature Development
"Preciso adicionar [feature]. Como implementar?"

### 4. Documentação
"Gere documentação para [módulo]."

### 5. Otimização
"Como posso melhorar a performance de [componente]?"

### 6. Testes
"Crie testes para [função]."

## Contexto Importante
- Este é um SaaS de chat com IA
- Autentica via JWT
- Cada usuário tem suas conversas
- IA é Ollama/Llama2
- Deploy é automático via GitHub Actions

## Branches Importantes
- main: produção
- feature/init-free-llm-api: desenvolvimento

## Secrets (Não Compartilhar)
- JWT_SECRET
- API_KEY
- RAILWAY_API_TOKEN
- VERCEL_TOKEN

EOF
```

#### C) Usar Claude para Monitoramento

Você pode criar um script que notifica Claude de erros:

```javascript
// backend/src/services/claude-notifier.js
import axios from 'axios';

export async function notifyClaudeOfError(error, context) {
  if (process.env.NODE_ENV !== 'production') return;
  
  const message = `
Erro em produção:

Mensagem: ${error.message}
Stack: ${error.stack}
Contexto: ${JSON.stringify(context)}
  `.trim();
  
  // Você pode enviar via Slack, Email, ou API do Claude
  console.error(`[CLAUDE ALERT] ${message}`);
}
```

## Parte 3: Usar Claude para Automação

### Opção A: Claude Revisa Pull Requests

Crie um script que chama Claude quando fizer PR:

```bash
#!/bin/bash
# scripts/claude-review.sh

echo "Enviando PR para revisão com Claude..."

# Extrair mudanças do git
git diff main..HEAD > changes.diff

# Chamar Claude API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 2048,
    "messages": [{
      "role": "user",
      "content": "Revise este código e identifique bugs:\n" + $(cat changes.diff)
    }]
  }'
```

### Opção B: Claude Gera Documentação Automática

```bash
#!/bin/bash
# scripts/claude-docs.sh

# Gerar docs para novo arquivo
echo "Gerando documentação com Claude..."

curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-sonnet-20240229",
    "max_tokens": 2048,
    "messages": [{
      "role": "user",
      "content": "Gere documentação JSDoc para este arquivo:\n" + $(cat $1)
    }]
  }'
```

## Parte 4: Integração com Slack + Claude

### Cenário: Deploy Falhou

1. GitHub Actions dispara erro
2. Envia mensagem para Slack
3. Slack chama webhook
4. Webhook chama Claude API
5. Claude sugere correção
6. Resposta volta para Slack

```javascript
// Webhook handler (exemplo Firebase Function)
export async function onDeployFailed(req, res) {
  const error = req.body.error;
  
  // Chamar Claude
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Deploy falhou com erro: ${error}. Qual é a causa e como corrigir?`
      }]
    })
  });
  
  const suggestion = await response.json();
  
  // Enviar de volta para Slack
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `Deploy Error Analysis:\n${suggestion.content[0].text}`
    })
  });
  
  res.json({ success: true });
}
```

## Parte 5: Usar Esta Conversa com Claude

### Para Você Fazer

1. **Compartilhar Este Documento:**
   ```
   Claude, aqui está meu projeto:
   [colar conteúdo de SECRETS_AND_VALIDATION.md]
   ```

2. **Pedir Revisão:**
   ```
   Por favor revise meu backend em backend/src/server.js
   ```

3. **Pedir Melhorias:**
   ```
   Como posso otimizar o chat para ser mais rápido?
   ```

4. **Pedir Testes:**
   ```
   Gere testes unitários para backend/src/routes/chat.js
   ```

5. **Pedir Documentação:**
   ```
   Gere um README melhor para o projeto.
   ```

## Parte 6: API Key do Claude

### Obter API Key

1. Acesse https://console.anthropic.com
2. Clique em "API Keys"
3. Clique em "Create Key"
4. Copie e guarde com segurança

### Configurar no Projeto

```bash
# .env
CLAUDE_API_KEY=sk-ant-seu-token-aqui
```

### Usar em Scripts

```bash
export CLAUDE_API_KEY="sk-ant-seu-token-aqui"
bash scripts/claude-review.sh
```

## Parte 7: Exemplo Real - Claude Analisa Logs

```bash
#!/bin/bash
# scripts/analyze-logs.sh

# Coletar logs
echo "Coletando logs de erro..."
sudo docker logs backend > logs.txt

# Enviar para Claude analisar
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-3-sonnet-20240229\",
    \"max_tokens\": 2048,
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"Analise estes logs e me diga os problemas e soluções:\\n$(cat logs.txt)\"
    }]
  }" | jq '.content[0].text'
```

## Resumo

Você pode usar Claude para:
- ✅ Revisar código
- ✅ Encontrar bugs
- ✅ Gerar testes
- ✅ Criar documentação
- ✅ Otimizar performance
- ✅ Analisar logs
- ✅ Sugerir arquitetura
- ✅ Ajudar com debugging

**Próximo Passo:** Copie seu repositório ou arquivo aqui e peça análise ao Claude!
