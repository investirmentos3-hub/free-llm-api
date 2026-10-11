# Free LLM API

🚀 API completa para conectar com FreeLLMAPI com chat, histórico, múltiplos modelos, streaming, rate limiting e autenticação.

## Características

✅ **Chat com IA** - Envie mensagens e receba respostas  
✅ **Histórico de Conversas** - Mantenha contexto entre mensagens  
✅ **Múltiplos Modelos** - Suporte a diferentes modelos LLM  
✅ **Autenticação** - Proteção com API Key  
✅ **Rate Limiting** - Controle de requisições  
✅ **Logging** - Rastreamento completo de operações  
✅ **Segurança** - Helmet, CORS, validação de entrada  
✅ **Health Check** - Monitoramento de status

## Pré-requisitos

- Node.js 16+
- npm ou yarn
- FreeLLMAPI rodando (padrão: `http://localhost:8000`)

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/investirmentos3-hub/free-llm-api.git
cd free-llm-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

## Configuração

Edite o arquivo `.env`:

```env
PORT=3000
NODE_ENV=development

# FreeLLMAPI Configuration
FREELLM_API_URL=http://localhost:8000
FREELLM_DEFAULT_MODEL=llama3

# Autenticação
API_KEY=sua_chave_api_secreta_aqui

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Executar

```bash
# Modo produção
npm start

# Modo desenvolvimento (com hot reload)
npm run dev
```

Será exibido:
```
🚀 Servidor rodando em http://localhost:3000
📡 FreeLLMAPI conectando em: http://localhost:8000
```

## Endpoints

### 🏥 Health Check

```bash
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-11T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "freeLLMAPI": {
    "status": "connected",
    "url": "http://localhost:8000"
  }
}
```

### 💬 Chat

#### Enviar Mensagem

```bash
POST /api/chat
Headers:
  X-API-Key: sua_chave_api_secreta_aqui
  Content-Type: application/json

Body:
{
  "message": "Olá, como você está?",
  "model": "llama3",
  "conversationId": "uuid-opcional"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "response": "Olá! Estou bem, obrigado por perguntar!",
    "model": "llama3",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-10-11T12:00:00.000Z"
  }
}
```

#### Obter Histórico

```bash
GET /api/chat/history/550e8400-e29b-41d4-a716-446655440000
Headers:
  X-API-Key: sua_chave_api_secreta_aqui
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "messageCount": 2,
    "messages": [
      {
        "role": "user",
        "content": "Olá, como você está?",
        "timestamp": "2024-10-11T12:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Olá! Estou bem, obrigado por perguntar!",
        "timestamp": "2024-10-11T12:00:01.000Z"
      }
    ]
  }
}
```

#### Limpar Histórico

```bash
DELETE /api/chat/history/550e8400-e29b-41d4-a716-446655440000
Headers:
  X-API-Key: sua_chave_api_secreta_aqui
```

**Resposta:**
```json
{
  "success": true,
  "message": "Histórico da conversação 550e8400-e29b-41d4-a716-446655440000 foi limpo"
}
```

### 🤖 Modelos

```bash
GET /api/models
Headers:
  X-API-Key: sua_chave_api_secreta_aqui
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "name": "llama3",
        "description": "Llama 3"
      },
      {
        "name": "mistral",
        "description": "Mistral"
      },
      {
        "name": "neural-chat",
        "description": "Neural Chat"
      }
    ],
    "count": 3
  }
}
```

## Exemplos com cURL

### Teste de Health

```bash
curl http://localhost:3000/health
```

### Enviar Mensagem

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_chave_api_secreta_aqui" \
  -d '{
    "message": "Explique o que é Machine Learning",
    "model": "llama3"
  }'
```

### Obter Modelos

```bash
curl http://localhost:3000/api/models \
  -H "X-API-Key: sua_chave_api_secreta_aqui"
```

## Exemplos com Python

```python
import requests

API_URL = "http://localhost:3000"
API_KEY = "sua_chave_api_secreta_aqui"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Enviar mensagem
response = requests.post(
    f"{API_URL}/api/chat",
    headers=headers,
    json={
        "message": "Olá, quem é você?",
        "model": "llama3"
    }
)

data = response.json()
print(f"Resposta: {data['data']['response']}")
conversation_id = data['data']['conversationId']

# Obter histórico
response = requests.get(
    f"{API_URL}/api/chat/history/{conversation_id}",
    headers=headers
)

print(response.json())
```

## Exemplos com JavaScript

```javascript
const API_URL = 'http://localhost:3000';
const API_KEY = 'sua_chave_api_secreta_aqui';

// Enviar mensagem
async function sendMessage(message, model = 'llama3') {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      model: model
    })
  });

  const data = await response.json();
  return data;
}

// Usar
sendMessage('Olá, quem é você?').then(data => {
  console.log('Resposta:', data.data.response);
  console.log('Conversation ID:', data.data.conversationId);
});
```

## Estrutura do Projeto

```
free-llm-api/
├── src/
│   ├── server.js           # Servidor principal
│   ├── config.js           # Configurações
│   ├── routes/             # Rotas da API
│   │   ├── chat.js         # Endpoints de chat
│   │   ├── models.js       # Endpoints de modelos
│   │   └── health.js       # Health check
│   ├── services/           # Serviços
│   │   └── llmClient.js    # Cliente FreeLLMAPI
│   ├── middleware/         # Middlewares
│   │   ├── auth.js         # Autenticação
│   │   ├── rateLimit.js    # Rate limiting
│   │   └── errorHandler.js # Tratamento de erros
│   └── utils/              # Utilitários
│       └── logger.js       # Sistema de logging
├── .env.example            # Variáveis de ambiente (exemplo)
├── .gitignore              # Arquivos ignorados pelo Git
├── package.json            # Dependências do projeto
└── README.md               # Este arquivo
```

## Segurança

- ✅ Validação de entrada
- ✅ Autenticação com API Key
- ✅ Rate limiting por IP
- ✅ CORS configurável
- ✅ Helmet para headers de segurança
- ✅ Timeout em requisições
- ✅ Logging de acessos

## Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

## Licença

MIT

## Suporte

Para problemas ou dúvidas, abra uma issue no GitHub:
[Issues](https://github.com/investirmentos3-hub/free-llm-api/issues)

## Changelog

### v1.0.0 (2024-10-11)
- ✨ Lançamento inicial da API
- ✨ Chat com histórico
- ✨ Suporte a múltiplos modelos
- ✨ Autenticação com API Key
- ✨ Rate limiting
- ✨ Health check
- ✨ Logging completo
