#!/bin/bash

# Script para monitorar saúde da aplicação

echo "🏥 Monitoramento de Saúde - Free LLM SaaS"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function check_status() {
    local name=$1
    local url=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}✓${NC} $name: OK (HTTP $response)"
    else
        echo -e "${RED}✗${NC} $name: ERRO (HTTP $response)"
    fi
}

# Verificar Backend
echo -e "${YELLOW}Backend:${NC}"
check_status "API Health" "http://localhost:3000/api/health"
check_status "Auth" "http://localhost:3000/api/auth/me" || true

# Verificar Frontend
echo ""
echo -e "${YELLOW}Frontend:${NC}"
check_status "Home" "http://localhost:5173"

# Verificar FreeLLMAPI
echo ""
echo -e "${YELLOW}FreeLLMAPI:${NC}"
check_status "Modelos" "http://localhost:8000/api/models" || echo -e "${YELLOW}ℹ${NC} FreeLLMAPI pode estar em outro host"

# Verificar Docker
echo ""
echo -e "${YELLOW}Docker:${NC}"
echo "Containers rodando:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "(sem permissão para ver Docker)"

# Verificar Disco
echo ""
echo -e "${YELLOW}Sistema:${NC}"
echo "Espaço em disco:"
df -h / | tail -1

# Verificar Uptime
echo ""
echo "Uptime:"
uptime -p 2>/dev/null || uptime

echo ""
echo "=========================================="
echo "✅ Verificação concluída"
