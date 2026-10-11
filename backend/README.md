# Free LLM SaaS Backend

Backend SaaS para autenticação, usuários, planos e chat com FreeLLMAPI.

## Instalação

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (com JWT)
- `GET /api/health`
- `GET /api/chat/models` (com JWT)
- `POST /api/chat/chat` (com JWT)
- `GET /api/chat/conversations` (com JWT)
- `GET /api/user/me` (com JWT)
- `GET /api/user/usage` (com JWT)

## Exemplo de registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria",
    "email": "maria@email.com",
    "password": "123456"
  }'
```

## Exemplo de login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@email.com",
    "password": "123456"
  }'
```

## Acesso autenticado

```bash
curl http://localhost:3000/api/user/me \
  -H "Authorization: Bearer SEU_TOKEN"
```
