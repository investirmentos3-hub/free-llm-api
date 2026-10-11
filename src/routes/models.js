import express from 'express';
import { llmService } from '../services/llmClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/models
 * Obter lista de modelos disponíveis
 */
router.get('/', async (req, res) => {
  try {
    const models = await llmService.getAvailableModels();

    res.json({
      success: true,
      data: {
        models: models,
        count: models.length
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter modelos: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
