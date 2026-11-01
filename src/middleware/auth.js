const jwt = require('jsonwebtoken');
const config = require('../config');

function authMiddleware(req, res, next) {
  const headerToken = req.headers.authorization;
  const headerApiKey = req.headers['x-api-key'];

  const token = headerToken && headerToken.startsWith('Bearer ')
    ? headerToken.slice('Bearer '.length)
    : null;

  const apiKey = headerApiKey || req.headers['x-api-key'];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid JWT token' });
    }
  }

  if (apiKey && apiKey === config.appApiKey) {
    req.user = { source: 'api-key' };
    return next();
  }

  return res.status(401).json({
    error: 'Authentication required. Use Authorization: Bearer <jwt> or X-API-Key header.'
  });
}

module.exports = authMiddleware;
