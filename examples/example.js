/**
 * Exemplos de uso da Free LLM API
 * Execute com: node examples/example.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';
const API_KEY = 'sua_chave_api_secreta_aqui'; // Mude conforme seu .env

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

/**
 * Exemplo 1: Health Check
 */
async function healthCheck() {
  console.log('\n🏥 Health Check...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('Status:', data.status);
    console.log('FreeLLMAPI:', data.freeLLMAPI?.status);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

/**
 * Exemplo 2: Listar Modelos
 */
async function listModels() {
  console.log('\n🤖 Listando Modelos...');
  try {
    const response = await fetch(`${API_URL}/api/models`, { headers });
    const data = await response.json();
    console.log('Modelos disponíveis:');
    data.data.models.forEach(model => {
      console.log(`  - ${model.name}: ${model.description}`);
    });
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

/**
 * Exemplo 3: Chat Único
 */
async function singleChat() {
  console.log('\n💬 Chat Único...');
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Olá! Quem é você?',
        model: 'llama3'
      })
    });
    const data = await response.json();
    console.log('Resposta:', data.data.response);
    console.log('Conversation ID:', data.data.conversationId);
    return data.data.conversationId;
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

/**
 * Exemplo 4: Chat com Histórico
 */
async function chatWithHistory() {
  console.log('\n📚 Chat com Histórico...');
  try {
    // Primeira mensagem
    let response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Meu nome é João',
        model: 'llama3'
      })
    });
    let data = await response.json();
    const conversationId = data.data.conversationId;
    console.log('1ª Mensagem - Resposta:', data.data.response);

    // Segunda mensagem (mantém contexto)
    response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Qual é meu nome?',
        conversationId: conversationId,
        model: 'llama3'
      })
    });
    data = await response.json();
    console.log('2ª Mensagem - Resposta:', data.data.response);

    // Visualizar histórico
    response = await fetch(`${API_URL}/api/chat/history/${conversationId}`, {
      headers
    });
    data = await response.json();
    console.log(`\nHistórico (${data.data.messageCount} mensagens):`);
    data.data.messages.forEach(msg => {
      console.log(`  [${msg.role}]: ${msg.content}`);
    });
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

/**
 * Executar todos os exemplos
 */
async function runAllExamples() {
  console.log('🚀 Free LLM API - Exemplos');
  console.log('================================');

  await healthCheck();
  await listModels();
  await singleChat();
  await chatWithHistory();

  console.log('\n✅ Exemplos completados!');
}

// Executar
runAllExamples();
