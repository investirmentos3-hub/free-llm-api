import { config } from '../config.js';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLogLevel = logLevels[config.logLevel] || logLevels.info;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m'
};

function getTimestamp() {
  return new Date().toISOString();
}

function log(level, message, data = null) {
  const levelNum = logLevels[level] || logLevels.info;
  if (levelNum > currentLogLevel) return;

  const colorCode = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.green,
    debug: colors.blue
  }[level];

  const timestamp = getTimestamp();
  const prefix = `${colorCode}[${timestamp}] [${level.toUpperCase()}]${colors.reset}`;
  
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  error: (message, data) => log('error', message, data),
  warn: (message, data) => log('warn', message, data),
  info: (message, data) => log('info', message, data),
  debug: (message, data) => log('debug', message, data)
};
