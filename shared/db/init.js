/**
 * Database Schema and Initialization
 * Run this once to set up all tables and indexes
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

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
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  region_type VARCHAR(20),
  connected_regions TEXT,
  last_update_day INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id SERIAL PRIMARY KEY,
  source_region_id INTEGER NOT NULL REFERENCES regions(id),
  infection_rate FLOAT NOT NULL,
  recovery_rate FLOAT NOT NULL,
  mortality_rate FLOAT NOT NULL DEFAULT 0.02,
  total_days INTEGER NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 0,
  mobility_factor FLOAT DEFAULT 1.0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_infected INTEGER DEFAULT 0,
  total_recovered INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  peak_infections INTEGER DEFAULT 0,
  peak_day INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Daily simulation snapshots
CREATE TABLE IF NOT EXISTS simulation_daily_data (
  id SERIAL PRIMARY KEY,
  simulation_id INTEGER NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  susceptible INTEGER,
  infected INTEGER,
  recovered INTEGER,
  deaths INTEGER,
  new_infections INTEGER,
  new_recoveries INTEGER,
  new_deaths INTEGER,
  spreading_regions TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Infection history for analytics
CREATE TABLE IF NOT EXISTS infection_history (
  id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  simulation_id INTEGER REFERENCES simulations(id),
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
  region_id INTEGER NOT NULL REFERENCES regions(id),
  simulation_id INTEGER REFERENCES simulations(id),
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
  allocated INTEGER DEFAULT 0,
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

-- Events log for event bus
CREATE TABLE IF NOT EXISTS events_log (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  source_service VARCHAR(100),
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_regions_risk_level ON regions(risk_level);
CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS idx_simulations_source_region ON simulations(source_region_id);
CREATE INDEX IF NOT EXISTS idx_infection_history_region ON infection_history(region_id);
CREATE INDEX IF NOT EXISTS idx_daily_data_simulation ON simulation_daily_data(simulation_id, day);
CREATE INDEX IF NOT EXISTS idx_allocations_region ON allocations(region_id);
CREATE INDEX IF NOT EXISTS idx_events_log_type ON events_log(event_type);
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
  // Seed with major Indian regions. Full 28 states will be populated on first simulation
  const regions = [
    ['Delhi', 16753235, Math.floor(16753235 * 0.999), Math.floor(16753235 * 0.001), 0, 0, 'LOW', 28.7041, 77.1025, 'UT', JSON.stringify(['Haryana', 'Uttar Pradesh'])],
    ['Haryana', 25351462, Math.floor(25351462 * 0.999), Math.floor(25351462 * 0.001), 0, 0, 'LOW', 29.0588, 77.0745, 'State', JSON.stringify(['Delhi', 'Punjab', 'Uttar Pradesh'])],
    ['Punjab', 27743338, Math.floor(27743338 * 0.999), Math.floor(27743338 * 0.001), 0, 0, 'LOW', 31.1471, 75.3412, 'State', JSON.stringify(['Haryana', 'Himachal Pradesh', 'Jammu & Kashmir'])],
    ['Uttar Pradesh', 199812341, Math.floor(199812341 * 0.999), Math.floor(199812341 * 0.001), 0, 0, 'LOW', 26.8467, 80.9462, 'State', JSON.stringify(['Delhi', 'Haryana', 'Punjab', 'Bihar', 'Madhya Pradesh', 'Rajasthan'])],
    ['West Bengal', 91276115, Math.floor(91276115 * 0.999), Math.floor(91276115 * 0.001), 0, 0, 'LOW', 24.8749, 88.2669, 'State', JSON.stringify(['Bihar', 'Jharkhand', 'Odisha', 'Assam'])],
    ['Maharashtra', 112374333, Math.floor(112374333 * 0.999), Math.floor(112374333 * 0.001), 0, 0, 'LOW', 19.8762, 75.3193, 'State', JSON.stringify(['Gujarat', 'Madhya Pradesh'])],
    ['Tamil Nadu', 72138958, Math.floor(72138958 * 0.999), Math.floor(72138958 * 0.001), 0, 0, 'LOW', 11.1271, 78.6569, 'State', JSON.stringify(['Andhra Pradesh', 'Karnataka', 'Kerala'])],
    ['Karnataka', 61130704, Math.floor(61130704 * 0.999), Math.floor(61130704 * 0.001), 0, 0, 'LOW', 15.3173, 75.7139, 'State', JSON.stringify(['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Goa', 'Tamil Nadu', 'Kerala'])],
    ['Bihar', 104099701, Math.floor(104099701 * 0.999), Math.floor(104099701 * 0.001), 0, 0, 'LOW', 25.5941, 85.1376, 'State', JSON.stringify(['West Bengal', 'Jharkhand', 'Uttar Pradesh'])],
    ['Andhra Pradesh', 84665533, Math.floor(84665533 * 0.999), Math.floor(84665533 * 0.001), 0, 0, 'LOW', 15.9129, 78.6675, 'State', JSON.stringify(['Chhattisgarh', 'Odisha', 'Telangana', 'Karnataka', 'Tamil Nadu'])],
  ];

  for (const region of regions) {
    await client.query(
      'INSERT INTO regions (name, population, susceptible, infected, recovered, deaths, risk_level, latitude, longitude, region_type, connected_regions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (name) DO NOTHING',
      region
    );
  }

  // Seed inventory with realistic quantities
  const inventory = [
    ['beds', 50000],
    ['icuBeds', 5000],
    ['vaccines', 100000],
    ['oxygen', 20000],
    ['ventilators', 1000],
    ['PPE', 500000],
  ];

  for (const [type, total] of inventory) {
    await client.query(
      'INSERT INTO inventory (resource_type, total_available) VALUES ($1, $2) ON CONFLICT (resource_type) DO NOTHING',
      [type, total]
    );
  }

  console.log('✓ Initial data seeded with 10 major Indian regions');
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  initializeDatabase().catch(console.error);
}

export { initializeDatabase };
