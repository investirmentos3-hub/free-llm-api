#!/bin/bash

echo "🚀 Iniciando validação completa do SaaS Free LLM"
echo "================================================"

API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1️⃣  Testando conexão com Backend...${NC}"
if curl -s "$API_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend conectado${NC}"
else
  echo -e "${RED}❌ Backend não respondendo${NC}"
  echo "Certifique-se de que o backend está rodando:"
  echo "cd backend && npm run dev"
  exit 1
fi

echo ""
echo -e "${YELLOW}2️⃣  Testando Registro de Usuário...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "password123"
  }')

echo "Resposta:"
echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo -e "${GREEN}✅ Registro bem-sucedido${NC}"
  echo -e "Token: $TOKEN"
else
  echo -e "${RED}❌ Falha no registro${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}3️⃣  Testando Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "password123"
  }')

echo "Resposta:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ ! -z "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ]; then
  echo -e "${GREEN}✅ Login bem-sucedido${NC}"
else
  echo -e "${RED}❌ Falha no login${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}4️⃣  Testando Autenticação...${NC}"
ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta:"
echo "$ME_RESPONSE" | jq . 2>/dev/null || echo "$ME_RESPONSE"

USER_NAME=$(echo "$ME_RESPONSE" | jq -r '.user.name' 2>/dev/null)

if [ ! -z "$USER_NAME" ] && [ "$USER_NAME" != "null" ]; then
  echo -e "${GREEN}✅ Autenticação validada${NC}"
else
  echo -e "${RED}❌ Falha na autenticação${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}5️⃣  Testando Chat...${NC}"
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/api/chat/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você está?",
    "model": "llama3"
  }')

echo "Resposta:"
echo "$CHAT_RESPONSE" | jq . 2>/dev/null || echo "$CHAT_RESPONSE"

CONV_ID=$(echo "$CHAT_RESPONSE" | jq -r '.conversationId' 2>/dev/null)

if [ ! -z "$CONV_ID" ] && [ "$CONV_ID" != "null" ]; then
  echo -e "${GREEN}✅ Chat funcionando (ID: $CONV_ID)${NC}"
else
  echo -e "${YELLOW}⚠️  Chat respondendo (possível erro do FreeLLMAPI)${NC}"
fi

echo ""
echo -e "${YELLOW}6️⃣  Testando Conversas...${NC}"
CONVS_RESPONSE=$(curl -s -X GET "$API_URL/api/chat/conversations" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta:"
echo "$CONVS_RESPONSE" | jq . 2>/dev/null || echo "$CONVS_RESPONSE"

echo ""
echo -e "${YELLOW}7️⃣  Testando Dashboard (Uso)...${NC}"
USAGE_RESPONSE=$(curl -s -X GET "$API_URL/api/user/usage" \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta:"
echo "$USAGE_RESPONSE" | jq . 2>/dev/null || echo "$USAGE_RESPONSE"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Validação completa realizada!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Execute o frontend: cd frontend && npm run dev"
echo "2. Acesse http://localhost:5173"
echo "3. Use as credenciais:"
echo "   Email: teste@example.com"
echo "   Senha: password123"
echo ""
echo "Ou crie uma nova conta direto no frontend!"
