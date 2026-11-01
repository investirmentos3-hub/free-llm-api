const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.FREE_LLM_API_BASE_URL || 'https://api.free-llm.com',
  apiKey: process.env.FREE_LLM_API_KEY || 'demo-key',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  appApiKey: process.env.API_KEY || 'change-me'
};

module.exports = config;
