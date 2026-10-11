import express from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Verificar status da API FreeLLMAPI
    const freellmStatus = await checkFreeLLMStatus();

    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      freeLLMAPI: freellmStatus
    };

    res.json(status);
  } catch (error) {
    logger.error(`Erro no health check: ${error.message}`);
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

async function checkFreeLLMStatus() {
  try {
    const response = await axios.get(`${config.freellmApiUrl}/health`, { timeout: 5000 });
    return {
      status: 'connected',
      url: config.freellmApiUrl
    };
  } catch (error) {
    return {
      status: 'disconnected',
      url: config.freellmApiUrl,
      error: error.message
    };
  }
}

export default router;
