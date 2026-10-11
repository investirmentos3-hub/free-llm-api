#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, text) {
  console.log(`${color}${text}${colors.reset}`);
}

function step(num, text) {
  console.log(`\n${colors.yellow}${num}️⃣  ${text}${colors.reset}`);
}

async function validate() {
  log(colors.blue, '\n🚀 Iniciando validação completa do SaaS Free LLM');
  log(colors.blue, '================================================\n');

  let token = null;
  let userId = null;

  // 1. Health Check
  step('1', 'Testando conexão com Backend...');
  try {
    const response = await axios.get(`${API_URL}`);
    log(colors.green, `✅ Backend conectado`);
  } catch (err) {
    log(colors.red, '❌ Backend não respondendo');
    log(colors.yellow, 'Execute: cd backend && npm run dev');
    process.exit(1);
  }

  // 2. Register
  step('2', 'Testando Registro de Usuário...');
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: `Teste ${Date.now()}`,
      email: `teste${Date.now()}@example.com`,
      password: 'password123'
    });
    token = response.data.token;
    userId = response.data.user.id;
    log(colors.green, `✅ Registro bem-sucedido`);
    log(colors.green, `   Token: ${token.slice(0, 20)}...`);
    log(colors.green, `   ID: ${userId}`);
  } catch (err) {
    log(colors.red, `❌ Falha no registro: ${err.response?.data?.error || err.message}`);
    process.exit(1);
  }

  // 3. Login
  step('3', 'Testando Login...');
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: `teste${Date.now() - 100}@example.com`,
      password: 'password123'
    });
    log(colors.green, `✅ Login bem-sucedido`);
  } catch (err) {
    log(colors.yellow, `⚠️  Login com usuário anterior falhou (esperado)`);
  }

  // 4. Get Current User
  step('4', 'Testando Autenticação...');
  try {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(colors.green, `✅ Autenticação validada`);
    log(colors.green, `   Usuário: ${response.data.user.name}`);
    log(colors.green, `   Email: ${response.data.user.email}`);
  } catch (err) {
    log(colors.red, `❌ Falha na autenticação: ${err.response?.data?.error || err.message}`);
    process.exit(1);
  }

  // 5. Get Models
  step('5', 'Testando Modelos Disponíveis...');
  try {
    const response = await axios.get(`${API_URL}/api/chat/models`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(colors.green, `✅ Modelos carregados`);
    log(colors.green, `   Contagem: ${response.data.models.length}`);
    response.data.models.slice(0, 3).forEach(m => {
      log(colors.green, `   - ${m.name}`);
    });
  } catch (err) {
    log(colors.yellow, `⚠️  Erro ao carregar modelos: ${err.response?.data?.error || err.message}`);
  }

  // 6. Send Chat Message
  step('6', 'Testando Chat...');
  try {
    const response = await axios.post(`${API_URL}/api/chat/chat`, {
      message: 'Olá! Como você está?',
      model: 'llama3'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(colors.green, `✅ Chat funcionando`);
    log(colors.green, `   Conversation ID: ${response.data.conversationId}`);
    log(colors.green, `   Resposta: ${response.data.response.slice(0, 50)}...`);
  } catch (err) {
    log(colors.yellow, `⚠️  Erro no chat: ${err.response?.data?.error || err.message}`);
    log(colors.yellow, `   Verifique se o FreeLLMAPI está rodando`);
  }

  // 7. Get Conversations
  step('7', 'Testando Conversas...');
  try {
    const response = await axios.get(`${API_URL}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(colors.green, `✅ Conversas carregadas`);
    log(colors.green, `   Total: ${response.data.conversations.length}`);
  } catch (err) {
    log(colors.red, `❌ Erro ao carregar conversas: ${err.response?.data?.error || err.message}`);
  }

  // 8. Get Usage Stats
  step('8', 'Testando Dashboard (Uso)...');
  try {
    const response = await axios.get(`${API_URL}/api/user/usage`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    log(colors.green, `✅ Uso carregado`);
    log(colors.green, `   Plano: ${response.data.plan}`);
    log(colors.green, `   Conversas: ${response.data.conversations}`);
    log(colors.green, `   Mensagens: ${response.data.messages}`);
  } catch (err) {
    log(colors.red, `❌ Erro ao carregar uso: ${err.response?.data?.error || err.message}`);
  }

  // Summary
  console.log(`\n${colors.blue}================================================${colors.reset}`);
  log(colors.green, '✅ Validação completa realizada!');
  console.log(`\n${colors.yellow}Próximos passos:${colors.reset}`);
  console.log('1. Execute o frontend: cd frontend && npm run dev');
  console.log('2. Acesse http://localhost:5173');
  console.log(`3. Use as credenciais:`);
  console.log(`   Email: (veja o registro acima)`);
  console.log(`   Senha: password123`);
  console.log('');
}

validate().catch(err => {
  log(colors.red, `Erro: ${err.message}`);
  process.exit(1);
});
