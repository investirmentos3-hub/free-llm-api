import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Rotas
import chatRouter from './routes/chat.js';
import modelsRouter from './routes/models.js';
import healthRouter from './routes/health.js';

// Middleware
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Rate limiting global
app.use(rateLimitMiddleware);

// Rotas públicas
app.use('/health', healthRouter);

// Middleware de autenticação (para rotas protegidas)
app.use('/api/', authMiddleware);

// Rotas protegidas
app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à Free LLM API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat',
      models: 'GET /api/models',
      chatHistory: 'GET /api/chat/history/:conversationId'
    },
    docs: 'https://github.com/investirmentos3-hub/free-llm-api'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Error Handler
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
  logger.info(`📡 FreeLLMAPI conectando em: ${process.env.FREELLM_API_URL}`);
});

export default app;
