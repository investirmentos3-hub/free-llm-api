const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();
const history = [];

async function callFreeLlmApi(payload) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Free LLM API error: ${response.status} ${text}`);
  }

  return response.json();
}

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'free-llm-api' });
});

router.get('/models', async (req, res) => {
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(502).json({
      error: 'Unable to fetch models from Free LLM provider',
      details: error.message
    });
  }
});

router.post('/chat', async (req, res) => {
  const { model, messages, temperature = 0.7, stream = false } = req.body || {};

  if (!model || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Body requires model and messages[]' });
  }

  try {
    const payload = {
      model,
      messages,
      temperature,
      stream
    };

    const result = await callFreeLlmApi(payload);

    const savedItem = {
      id: `msg_${Date.now()}`,
      model,
      messages,
      result,
      createdAt: new Date().toISOString()
    };

    history.push(savedItem);

    return res.json({
      success: true,
      data: result,
      historyId: savedItem.id
    });
  } catch (error) {
    return res.status(500).json({ error: 'Chat request failed', details: error.message });
  }
});

router.get('/history', (req, res) => {
  res.json({ items: history });
});

router.post('/auth/token', (req, res) => {
  const { username = 'user' } = req.body || {};

  const token = jwt.sign({ username, role: 'user' }, config.jwtSecret, { expiresIn: '1h' });

  return res.json({ token });
});

module.exports = router;
