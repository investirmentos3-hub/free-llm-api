import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { generateAIResponse, getAvailableModels } from './services/ai-router.js';
import { projectRegistry } from './config/projects.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const DB_PATH = process.env.DB_PATH || './data/app.db';

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      model TEXT DEFAULT 'ollama:llama2',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      provider TEXT,
      model TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      conversations INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      plan TEXT DEFAULT 'free',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
};

initDb();

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  apiKey: user.api_key,
  plan: user.plan,
});

const ensureUsageRow = (userId) => {
  const row = db.prepare('SELECT * FROM usage WHERE user_id = ?').get(userId);
  if (row) return row;
  const id = cryptoRandomId();
  db.prepare(
    'INSERT INTO usage (id, user_id, conversations, messages, plan, updated_at) VALUES (?, ?, 0, 0, ?, CURRENT_TIMESTAMP)'
  ).run(id, userId, 'free');
  return db.prepare('SELECT * FROM usage WHERE user_id = ?').get(userId);
};

const cryptoRandomId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'Usuário inválido' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'online', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    const id = cryptoRandomId();
    const apiKey = ['sk_', cryptoRandomId()].join('');
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(
      'INSERT INTO users (id, name, email, password, api_key, plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    ).run(id, name, email.toLowerCase(), passwordHash, apiKey, 'free');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const token = createToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro ao criar usuário' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = createToken(user);
    return res.json({ token, user: serializeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro ao autenticar usuário' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});

app.get('/api/chat/models', authMiddleware, (req, res) => {
  return res.json({ models: getAvailableModels() });
});

app.get('/api/projects', authMiddleware, (req, res) => {
  return res.json({ projects: projectRegistry });
});

app.get('/api/chat/conversations', authMiddleware, (req, res) => {
  const rows = db.prepare(
    `SELECT c.*, json_group_array(json_object('role', m.role, 'content', m.content, 'provider', m.provider, 'model', m.model)) as messages
     FROM conversations c
     LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE c.user_id = ?
     GROUP BY c.id
     ORDER BY c.updated_at DESC`
  ).all(req.user.id);

  const parsed = rows.map((row) => ({
    ...row,
    messages: row.messages ? JSON.parse(row.messages) : [],
  }));

  return res.json({ conversations: parsed });
});

app.get('/api/user/usage', authMiddleware, (req, res) => {
  const usage = ensureUsageRow(req.user.id);
  return res.json({
    plan: usage.plan,
    conversations: Number(usage.conversations || 0),
    messages: Number(usage.messages || 0),
  });
});

app.post('/api/chat/chat', authMiddleware, async (req, res) => {
  try {
    const { message, model = 'ollama:llama2', conversationId } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    let conversation = null;

    if (conversationId) {
      conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?').get(conversationId, req.user.id);
    }

    if (!conversation) {
      const newId = cryptoRandomId();
      db.prepare(
        'INSERT INTO conversations (id, user_id, title, model, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      ).run(newId, req.user.id, String(message).slice(0, 50), model);
      conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(newId);
    }

    db.prepare(
      'INSERT INTO messages (id, conversation_id, role, content, provider, model, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(cryptoRandomId(), conversation.id, 'user', String(message).trim(), model.split(':')[0], model,);

    const aiResponse = await generateAIResponse({
      model,
      message: String(message).trim(),
      conversationId: conversation.id,
      userId: req.user.id,
    });

    db.prepare(
      'INSERT INTO messages (id, conversation_id, role, content, provider, model, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(cryptoRandomId(), conversation.id, 'assistant', aiResponse.text, aiResponse.provider, aiResponse.model);

    const usage = ensureUsageRow(req.user.id);
    db.prepare(
      'UPDATE usage SET conversations = ?, messages = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(Number(usage.conversations || 0) + 1, Number(usage.messages || 0) + 2, req.user.id);

    db.prepare(
      'UPDATE conversations SET model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(model, conversation.id);

    return res.json({
      conversationId: conversation.id,
      response: aiResponse.text,
      provider: aiResponse.provider,
      model: aiResponse.model,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro ao gerar resposta' });
  }
});

app.listen(PORT, () => {
  console.log(`Free LLM SaaS backend running on http://localhost:${PORT}`);
});

export default app;
