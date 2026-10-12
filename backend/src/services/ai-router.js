export const generateAIResponse = async ({ model, message, conversationId, userId }) => {
  const models = getAvailableModels();

  let selectedModel = model || 'ollama:llama2';
  if (!selectedModel.includes(':')) {
    selectedModel = `ollama:${selectedModel}`;
  }

  const [providerName, modelName] = selectedModel.split(':');
  const fallbackOrder = [providerName, 'ollama', 'openai', 'anthropic', 'mistral', 'groq'];

  for (const provider of fallbackOrder) {
    try {
      const providerModule = await import(`./providers/${provider}.js`);
      const obj = providerModule.default || providerModule;
      if (typeof obj.generateText !== 'function') continue;
      const result = await obj.generateText({ message, model: modelName, conversationId, userId });
      if (result && result.text) {
        return { provider, model: modelName, text: result.text };
      }
    } catch (err) {
      // provider unavailable or not implemented; continue to next fallback
    }
  }

  return {
    provider: 'ollama',
    model: 'llama2',
    text: `Não foi possível responder com o modelo solicitado. Verifique a chave da API ou o serviço local (${process.env.FREELLM_API_URL || 'http://localhost:11434'}).`,
  };
};

export { getAvailableModels } from './config/llm-providers.js';
