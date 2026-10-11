import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logger.warn(`Acesso negado: API Key ausente - ${req.path}`);
    return res.status(401).json({
      error: 'API Key é obrigatória',
      hint: 'Use header: X-API-Key: sua_chave_api'
    });
  }

  if (apiKey !== config.apiKey) {
    logger.warn(`Acesso negado: API Key inválida - ${req.path}`);
    return res.status(403).json({
      error: 'API Key inválida'
    });
  }

  logger.debug(`Autenticação bem-sucedida para ${req.path}`);
  next();
};
