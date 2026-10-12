import axios from 'axios';

const defaultHeaders = (apiKey) => ({
  'Content-Type': 'application/json',
  ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
});

const callProvider = async ({ url, method = 'post', body, headers = {} }) => {
  const response = await axios({
    method,
    url,
    data: body,
    headers,
    timeout: 60000,
  });
  return response.data;
};

export const generateOpenAI = async ({ message, model = 'gpt-4o-mini' }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const data = await callProvider({
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'post',
    headers: defaultHeaders(apiKey),
    body: {
      model,
      messages: [{ role: 'user', content: message }],
    },
  });

  return { text: data.choices?.[0]?.message?.content || 'Sem resposta do provedor OpenAI' };
};

export const generateAnthropic = async ({ message, model = 'claude-3-5-sonnet-20241022' }) => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('CLAUDE_API_KEY missing');

  const data = await callProvider({
    url: 'https://api.anthropic.com/v1/messages',
    method: 'post',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: {
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
    },
  });

  return { text: data.content?.[0]?.text || 'Sem resposta do provedor Anthropic' };
};

export const generateMistral = async ({ message, model = 'mistral-large-latest' }) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY missing');

  const data = await callProvider({
    url: 'https://api.mistral.ai/v1/chat/completions',
    method: 'post',
    headers: defaultHeaders(apiKey),
    body: {
      model,
      messages: [{ role: 'user', content: message }],
    },
  });

  return { text: data.choices?.[0]?.message?.content || 'Sem resposta do provedor Mistral' };
};

export const generateGroq = async ({ message, model = 'llama-3.1-8b-instant' }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY missing');

  const data = await callProvider({
    url: 'https://api.groq.com/openai/v1/chat/completions',
    method: 'post',
    headers: defaultHeaders(apiKey),
    body: {
      model,
      messages: [{ role: 'user', content: message }],
    },
  });

  return { text: data.choices?.[0]?.message?.content || 'Sem resposta do provedor Groq' };
};

export const generateTogether = async ({ message, model = 'meta-llama/Llama-3.1-70B-Instruct-Turbo' }) => {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error('TOGETHER_API_KEY missing');

  const data = await callProvider({
    url: 'https://api.together.xyz/v1/chat/completions',
    method: 'post',
    headers: defaultHeaders(apiKey),
    body: {
      model,
      messages: [{ role: 'user', content: message }],
    },
  });

  return { text: data.choices?.[0]?.message?.content || 'Sem resposta do provedor Together' };
};

export const generateCohere = async ({ message, model = 'command-r' }) => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error('COHERE_API_KEY missing');

  const data = await callProvider({
    url: 'https://api.cohere.ai/v1/chat',
    method: 'post',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model,
      message,
    },
  });

  return { text: data.text || data.message?.content?.[0]?.text || 'Sem resposta do provedor Cohere' };
};

export const generateOllama = async ({ message, model = 'llama2' }) => {
  const baseUrl = process.env.FREELLM_API_URL || 'http://localhost:11434';
  const data = await callProvider({
    url: `${baseUrl}/api/generate`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: {
      model,
      prompt: message,
      stream: false,
    },
  });

  return { text: data.response || 'Sem resposta do Ollama local' };
};

export const generateHuggingFace = async ({ message, model = 'meta-llama/Llama-3.1-8B-Instruct' }) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY missing');

  const data = await callProvider({
    url: `https://api-inference.huggingface.co/models/${model}`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: { inputs: message },
  });

  const output = Array.isArray(data) ? data[0] : data;
  return { text: output?.generated_text || output?.text || 'Sem resposta do Hugging Face' };
};

export default {
  generateOpenAI,
  generateAnthropic,
  generateMistral,
  generateGroq,
  generateTogether,
  generateCohere,
  generateOllama,
  generateHuggingFace,
};
