# Free LLM Web

Frontend completo para consumir a API Free LLM.

## Como rodar

```bash
cd web
npm install
npm run dev
```

Acesse: http://localhost:5173

## Variáveis de ambiente

Crie um arquivo `.env` se quiser customizar:

```env
VITE_API_URL=http://localhost:3000
```

## Funcionalidades

- Chat visual com IA
- Histórico de conversas no navegador
- Seleção de modelo
- API Key e URL configuráveis
- Modo claro/escuro
- Layout responsivo
- Integração com a API REST do backend

## Requisitos

- Backend em execução em `http://localhost:3000`
- API Key válida inserida na interface
