import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const llmClient = axios.create({
  baseURL: config.freellmApiUrl,
  timeout: 30000
});

export class LLMService {
  constructor() {
    this.conversationHistory = new Map();
  }

  /**
   * Enviar mensagem para o modelo LLM
   */
  async sendMessage(message, model = config.freellmDefaultModel, conversationId = null) {
    try {
      logger.debug(`Enviando mensagem ao modelo ${model}`);

      // Obter histórico se conversationId fornecido
      const messages = this.getConversationMessages(conversationId);
      messages.push({ role: 'user', content: message });

      const response = await llmClient.post('/chat', {
        model: model,
        messages: messages,
        temperature: 0.7,
        top_p: 0.9
      });

      const assistantMessage = response.data.message || response.data.choices?.[0]?.message?.content || '';

      // Salvar no histórico
      if (conversationId) {
        this.saveToHistory(conversationId, message, assistantMessage);
      }

      logger.info(`Resposta recebida do modelo ${model}`);

      return {
        response: assistantMessage,
        model: model,
        conversationId: conversationId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Erro ao enviar mensagem: ${error.message}`);
      throw new Error(`Erro ao comunicar com FreeLLMAPI: ${error.message}`);
    }
  }

  /**
   * Obter lista de modelos disponíveis
   */
  async getAvailableModels() {
    try {
      logger.debug('Buscando modelos disponíveis');

      const response = await llmClient.get('/models');
      
      // Se a API retorna diretamente os modelos
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Se a API retorna em um formato diferente
      if (response.data.models) {
        return response.data.models;
      }

      // Fallback com modelos comuns
      return [
        { name: 'llama3', description: 'Llama 3' },
        { name: 'mistral', description: 'Mistral' },
        { name: 'neural-chat', description: 'Neural Chat' }
      ];
    } catch (error) {
      logger.warn(`Erro ao buscar modelos: ${error.message}. Usando fallback.`);
      return [
        { name: 'llama3', description: 'Llama 3' },
        { name: 'mistral', description: 'Mistral' },
        { name: 'neural-chat', description: 'Neural Chat' }
      ];
    }
  }

  /**
   * Salvar mensagem no histórico
   */
  saveToHistory(conversationId, userMessage, assistantMessage) {
    if (!this.conversationHistory.has(conversationId)) {
      this.conversationHistory.set(conversationId, []);
    }

    const history = this.conversationHistory.get(conversationId);
    history.push(
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() }
    );

    logger.debug(`Histórico atualizado para conversação ${conversationId}`);
  }

  /**
   * Obter histórico de conversação
   */
  getConversationHistory(conversationId) {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Obter apenas as mensagens (sem timestamps) para enviar ao modelo
   */
  getConversationMessages(conversationId) {
    if (!conversationId) return [];
    
    const history = this.getConversationHistory(conversationId);
    return history.map(({ role, content }) => ({ role, content }));
  }

  /**
   * Limpar histórico de uma conversação
   */
  clearConversationHistory(conversationId) {
    this.conversationHistory.delete(conversationId);
    logger.info(`Histórico da conversação ${conversationId} foi limpo`);
  }
}

export const llmService = new LLMService();
