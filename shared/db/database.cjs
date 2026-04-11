/**
 * PostgreSQL Database Connection
 * CommonJS bridge for service packages that still use require().
 */

const { Pool } = require('pg');
require('dotenv').config();

let pool = null;

function createPool() {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'epidemic_user',
    password: process.env.DB_PASSWORD || 'epidemic_password',
    database: process.env.DB_NAME || 'epidemic_simulation',
    max: process.env.DB_POOL_SIZE || 10,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 10000,
    connectionTimeoutMillis: 5000,
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    pool.on('connect', () => {
      console.log('Database connection established');
    });
  }
  return pool;
}

const query = async (text, params = []) => {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const activePool = getPool();
      return await activePool.query(text, params);
    } catch (err) {
      lastError = err;
      console.error(`Query attempt ${attempt + 1} failed:`, err.message);

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }

  throw lastError;
};

const getClient = () => {
  const activePool = getPool();
  return activePool.connect();
};

const close = () => {
  if (pool) {
    return pool.end();
  }
  return Promise.resolve();
};

module.exports = {
  query,
  getClient,
  close,
  pool: getPool,
};