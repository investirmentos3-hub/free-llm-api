import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const providers = {
  openai: {
    enabled: !!process.env.OPENAI_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini']
  },
  anthropic: {
    enabled: !!process.env.CLAUDE_API_KEY,
    apiKey: process.env.CLAUDE_API_KEY,
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  },
  mistral: {
    enabled: !!process.env.MISTRAL_API_KEY,
    apiKey: process.env.MISTRAL_API_KEY,
    models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest']
  },
  groq: {
    enabled: !!process.env.GROQ_API_KEY,
    apiKey: process.env.GROQ_API_KEY,
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
  },
  together: {
    enabled: !!process.env.TOGETHER_API_KEY,
    apiKey: process.env.TOGETHER_API_KEY,
    models: ['meta-llama/Llama-3.1-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1']
  },
  cohere: {
    enabled: !!process.env.COHERE_API_KEY,
    apiKey: process.env.COHERE_API_KEY,
    models: ['command-r-plus', 'command-r', 'command-light']
  },
  ollama: {
    enabled: true,
    url: process.env.FREELLM_API_URL || 'http://localhost:11434',
    models: ['llama2', 'mistral', 'codellama', 'phi3', 'qwen2.5', 'deepseek-r1']
  },
  huggingface: {
    enabled: !!process.env.HUGGINGFACE_API_KEY,
    apiKey: process.env.HUGGINGFACE_API_KEY,
    models: ['meta-llama/Llama-3.1-8B-Instruct']
  }
};

export function getAvailableModels() {
  const list = [];

  for (const [provider, config] of Object.entries(providers)) {
    if (!config.enabled) continue;

    for (const model of config.models) {
      list.push({ provider, model, label: `${provider}:${model}` });
    }
  }

  if (list.length === 0) {
    return [{ provider: 'ollama', model: 'llama2', label: 'ollama:llama2' }];
  }

  return list;
}

export default providers;
