/**
 * PostgreSQL Database Connection
 * Shared across services using connection pooling
 */

const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 30;

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
      connectionAttempts = 0;
    });
  }
  return pool;
}

/**
 * Execute query with automatic retry logic
 */
const query = async (text, params = []) => {
  let lastError;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const pool = getPool();
      return await pool.query(text, params);
    } catch (err) {
      lastError = err;
      console.error(`Query attempt ${attempt + 1} failed:`, err.message);
      
      if (attempt < 2) {
        // Wait before retrying (100ms * attempt)
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Get a client from the pool for transactions
 */
const getClient = () => {
  const pool = getPool();
  return pool.connect();
};

/**
 * Close the pool
 */
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
  pool: getPool
};
