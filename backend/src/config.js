import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  apiKey: process.env.API_KEY || 'default-api-key',
  freellmApiUrl: process.env.FREELLM_API_URL || 'http://localhost:8000',
  freellmDefaultModel: process.env.FREELLM_DEFAULT_MODEL || 'llama3',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  dbPath: process.env.DB_PATH || './data/app.db'
};
