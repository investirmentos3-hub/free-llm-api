import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Erro na requisição:', {
    message: err.message,
    path: req.path,
    method: req.method
  });

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString()
  });
};
