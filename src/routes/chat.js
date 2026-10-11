import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { llmService } from '../services/llmClient.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/chat
 * Enviar mensagem para o modelo LLM
 */
router.post('/', async (req, res) => {
  try {
    const { message, model, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Campo "message" é obrigatório'
      });
    }

    const newConversationId = conversationId || uuidv4();

    const result = await llmService.sendMessage(
      message,
      model,
      newConversationId
    );

    res.json({
      success: true,
      data: {
        ...result,
        conversationId: newConversationId
      }
    });
  } catch (error) {
    logger.error(`Erro na rota /chat: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * GET /api/chat/history/:conversationId
 * Obter histórico de uma conversação
 */
router.get('/history/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;

    const history = llmService.getConversationHistory(conversationId);

    res.json({
      success: true,
      data: {
        conversationId,
        messageCount: history.length,
        messages: history
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter histórico: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * DELETE /api/chat/history/:conversationId
 * Limpar histórico de uma conversação
 */
router.delete('/history/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;

    llmService.clearConversationHistory(conversationId);

    res.json({
      success: true,
      message: `Histórico da conversação ${conversationId} foi limpo`
    });
  } catch (error) {
    logger.error(`Erro ao limpar histórico: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
