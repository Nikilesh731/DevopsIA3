/**
 * Quick Database Setup Script
 * Creates user and database if they don't exist
 */

const { Pool } = require('pg');

const setup = async () => {
  // First, connect as postgres (default admin user)
  const adminPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Sairam@73',
    database: 'postgres'
  });

  try {
    console.log('🔗 Connecting to PostgreSQL...');
    const client = await adminPool.connect();
    console.log('✓ Connected successfully');

    // Create user
    try {
      await client.query(`
        CREATE USER epidemic_user WITH PASSWORD 'epidemic_password';
      `);
      console.log('✓ User created: epidemic_user');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ User already exists: epidemic_user');
      } else {
        throw err;
      }
    }

    // Grant privileges
    await client.query(`
      ALTER ROLE epidemic_user WITH CREATEDB;
    `);
    console.log('✓ Privileges granted');

    // Create database
    try {
      await client.query(`
        CREATE DATABASE epidemic_simulation OWNER epidemic_user;
      `);
      console.log('✓ Database created: epidemic_simulation');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ Database already exists: epidemic_simulation');
      } else {
        throw err;
      }
    }

    client.release();

    // Now connect to new database and initialize schema
    console.log('\n📊 Initializing database schema...');
    
    const appPool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'epidemic_user',
      password: 'epidemic_password',
      database: 'epidemic_simulation'
    });

    const appClient = await appPool.connect();

    // Create tables
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

    await appClient.query(schema);
    console.log('✓ Database schema created');

    // Seed data
    console.log('\n🌱 Seeding initial data...');
    
    const regions = [
      ['North City', 500000, 500000, 0, 0, 0, 'LOW', 28.6139, 77.2090],
      ['Central Region', 750000, 750000, 5, 0, 0, 'LOW', 28.7041, 77.1025],
      ['South District', 600000, 588000, 12, 0, 0, 'MEDIUM', 28.5355, 77.3910],
      ['East Zone', 450000, 442000, 8, 0, 0, 'LOW', 28.6692, 77.4538],
      ['West Province', 800000, 800000, 0, 0, 0, 'LOW', 28.4595, 77.0266],
    ];

    for (const region of regions) {
      await appClient.query(
        'INSERT INTO regions (name, population, susceptible, infected, recovered, deaths, risk_level, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (name) DO NOTHING',
        region
      );
    }

    const inventory = [
      ['beds', 5000],
      ['vaccines', 10000],
      ['oxygen', 2000],
    ];

    for (const [type, total] of inventory) {
      await appClient.query(
        'INSERT INTO inventory (resource_type, total_available) VALUES ($1, $2) ON CONFLICT (resource_type) DO NOTHING',
        [type, total]
      );
    }

    console.log('✓ Initial data seeded');

    // Test query
    const result = await appClient.query('SELECT COUNT(*) as region_count FROM regions');
    console.log(`\n✓ Database ready with ${result.rows[0].region_count} regions`);

    appClient.release();
    await appPool.end();
    await adminPool.end();

    console.log('\n🎉 PostgreSQL setup complete!');
    console.log('\n📋 Connection Details:');
    console.log('   Host: localhost');
    console.log('   Port: 5432');
    console.log('   User: epidemic_user');
    console.log('   Password: epidemic_password');
    console.log('   Database: epidemic_simulation');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setup();
