/**
 * Database Schema and Initialization
 * Run this once to set up all tables and indexes
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'epidemic_user',
  password: process.env.DB_PASSWORD || 'epidemic_password',
  database: process.env.DB_NAME || 'epidemic_simulation',
});

const schema = `
-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  population INTEGER NOT NULL,
  susceptible INTEGER NOT NULL DEFAULT 0,
  infected INTEGER NOT NULL DEFAULT 0,
  recovered INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Infection history for analytics
CREATE TABLE IF NOT EXISTS infection_history (
  id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  susceptible INTEGER,
  infected INTEGER,
  recovered INTEGER,
  deaths INTEGER,
  severity VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource allocations
CREATE TABLE IF NOT EXISTS allocations (
  id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  simulation_id INTEGER,
  resource_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255),
  severity VARCHAR(50)
);

-- Resource inventory
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  resource_type VARCHAR(100) NOT NULL UNIQUE,
  total_available INTEGER NOT NULL,
  reserved INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics cache
CREATE TABLE IF NOT EXISTS region_priority_scores (
  id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  priority_score FLOAT NOT NULL,
  infection_ratio FLOAT,
  population_at_risk INTEGER,
  resource_demand_level VARCHAR(50),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(region_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_regions_risk_level ON regions(risk_level);
CREATE INDEX IF NOT EXISTS idx_infection_history_region ON infection_history(region_id);
CREATE INDEX IF NOT EXISTS idx_allocations_region ON allocations(region_id);
CREATE INDEX IF NOT EXISTS idx_priority_scores_score ON region_priority_scores(priority_score DESC);
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');
    await client.query(schema);
    console.log('✓ Database schema created successfully');
    
    // Seed initial data
    console.log('Seeding initial data...');
    await seedData(client);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function seedData(client) {
  const regions = [
    ['North City', 500000, 500000, 0, 0, 0, 'LOW', 28.6139, 77.2090],
    ['Central Region', 750000, 750000, 5, 0, 0, 'LOW', 28.7041, 77.1025],
    ['South District', 600000, 588000, 12, 0, 0, 'MEDIUM', 28.5355, 77.3910],
    ['East Zone', 450000, 442000, 8, 0, 0, 'LOW', 28.6692, 77.4538],
    ['West Province', 800000, 800000, 0, 0, 0, 'LOW', 28.4595, 77.0266],
  ];

  for (const region of regions) {
    await client.query(
      'INSERT INTO regions (name, population, susceptible, infected, recovered, deaths, risk_level, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (name) DO NOTHING',
      region
    );
  }

  // Seed inventory
  const inventory = [
    ['beds', 5000],
    ['vaccines', 10000],
    ['oxygen', 2000],
  ];

  for (const [type, total] of inventory) {
    await client.query(
      'INSERT INTO inventory (resource_type, total_available) VALUES ($1, $2) ON CONFLICT (resource_type) DO NOTHING',
      [type, total]
    );
  }

  console.log('✓ Initial data seeded');
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };
