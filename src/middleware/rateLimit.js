import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit atingido para IP: ${req.ip}`);
    res.status(429).json({
      error: 'Limite de requisições atingido',
      retryAfter: req.rateLimit.resetTime
    });
  }
});
