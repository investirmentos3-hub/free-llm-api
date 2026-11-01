const express = require('express');
const cors = require('cors');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const llmRoutes = require('./routes/llm');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'running' });
});

app.post('/api/v1/auth/token', (req, res) => {
  const jwt = require('jsonwebtoken');
  const { username = 'user' } = req.body || {};
  const token = jwt.sign({ username, role: 'user' }, config.jwtSecret, { expiresIn: '1h' });
  res.json({ token });
});

app.use('/api/v1', authMiddleware, llmRoutes);

app.listen(config.port, () => {
  console.log(`Free LLM API running on http://localhost:${config.port}`);
});

module.exports = app;
