#!/bin/bash

# Script para validar tudo antes de fazer push para produção
# Uso: bash scripts/final-validation.sh

set -euo pipefail

echo "📊 Iniciando validação final..."
echo "========================================"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass=0
fail=0

function check() {
  local name=$1
  local cmd=$2
  
  if eval "$cmd" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name"
    ((pass++))
  else
    echo -e "${RED}✗${NC} $name"
    ((fail++))
  fi
}

echo ""
echo "[BACKEND]"
cd backend
check "Backend: npm install" "npm install"
check "Backend: syntax check" "node --check src/server.js"
check "Backend: .env existe" "test -f .env"

echo ""
echo "[FRONTEND]"
cd "$ROOT/frontend"
check "Frontend: npm install" "npm install"
check "Frontend: build" "npm run build"
check "Frontend: .env.local existe" "test -f .env.local"

echo ""
echo "[SECRETS]"
cd "$ROOT"
check "GitHub workflow existe" "test -f .github/workflows/deploy.yml"
check "Setup script existe" "test -f scripts/setup-production.sh"
check "Validation script existe" "test -f scripts/validate.js"

echo ""
echo "[DOCUMENTACAO]"
check "README existe" "test -f README.md"
check "DEPLOYMENT.md existe" "test -f DEPLOYMENT.md"
check "SECRETS_AND_VALIDATION.md existe" "test -f SECRETS_AND_VALIDATION.md"
check "CLAUDE_INTEGRATION.md existe" "test -f CLAUDE_INTEGRATION.md"

echo ""
echo "========================================"
echo -e "${GREEN}Passou: $pass${NC} | ${RED}Falhou: $fail${NC}"

if [ $fail -eq 0 ]; then
  echo -e "${GREEN}✅ Tudo validado! Pronto para fazer push.${NC}"
  echo ""
  echo "Próximos passos:"
  echo "1. git add ."
  echo "2. git commit -m 'feat: production ready'"
  echo "3. git push origin feature/init-free-llm-api"
  echo "4. Verificar GitHub Actions em: github.com/.../actions"
  exit 0
else
  echo -e "${RED}❌ Alguns testes falharam. Corrija os erros acima.${NC}"
  exit 1
fi
