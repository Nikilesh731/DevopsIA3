/**
 * PostgreSQL Database Connection
 * Shared across services using connection pooling
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'epidemic_user',
  password: process.env.DB_PASSWORD || 'epidemic_password',
  database: process.env.DB_NAME || 'epidemic_simulation',
  max: process.env.DB_POOL_SIZE || 10,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute query with automatic connection pooling
 */
const query = (text, params = []) => {
  return pool.query(text, params);
};

/**
 * Get a client from the pool for transactions
 */
const getClient = () => {
  return pool.connect();
};

/**
 * Close the pool
 */
const close = () => {
  return pool.end();
};

module.exports = {
  query,
  getClient,
  close,
  pool
};
