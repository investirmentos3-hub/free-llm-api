# Free LLM SaaS

Este projeto combina:

- Backend em Node.js + Express
- Frontend em React + Vite
- Autenticação JWT
- Dashboard SaaS
- Chat com IA
- API keys por usuário
- Rate limiting
- Banco SQLite local

## Estrutura

- `backend/` — API e autenticação
- `web/` — frontend dashboard e chat

## Como rodar

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd web
npm install
npm run dev
```

## Acesso rápido

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Observações

- Ajuste os valores no `.env` do backend.
- O backend espera que o FreeLLMAPI esteja em `FREELLM_API_URL`.
- Use a API key gerada ao registrar um usuário.
