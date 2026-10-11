import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // FreeLLMAPI
  freellmApiUrl: process.env.FREELLM_API_URL || 'http://localhost:8000',
  freellmDefaultModel: process.env.FREELLM_DEFAULT_MODEL || 'llama3',
  
  // Autenticação
  apiKey: process.env.API_KEY || 'default-api-key',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
