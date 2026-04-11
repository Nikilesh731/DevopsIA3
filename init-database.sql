-- Initialize database with schema and seed data for Distributed Epidemic Simulation

-- ============================================================
-- SCHEMA CREATION
-- ============================================================

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

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  region VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit VARCHAR(50),
  status VARCHAR(50) DEFAULT 'available',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faults table
CREATE TABLE IF NOT EXISTS faults (
  id SERIAL PRIMARY KEY,
  severity VARCHAR(50) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  affected_service VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
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

-- ============================================================
-- SEED DATA - REAL WORKFLOW
-- ============================================================

-- Insert Indian regions with realistic population data
INSERT INTO regions (name, population, susceptible, infected, recovered, deaths, risk_level, latitude, longitude, region_type, connected_regions) VALUES
  ('Delhi', 32938000, 32900000, 25000, 10000, 100, 'MEDIUM', 28.7041, 77.1025, 'Urban', 'Haryana,Uttar_Pradesh'),
  ('Mumbai', 20961472, 20900000, 35000, 15000, 120, 'HIGH', 19.0760, 72.8777, 'Urban', 'Maharashtra'),
  ('Bangalore', 12476000, 12400000, 18000, 8000, 75, 'MEDIUM', 12.9716, 77.5946, 'Urban', 'Karnataka'),
  ('Chennai', 7088000, 7050000, 12000, 5000, 50, 'LOW', 13.0827, 80.2707, 'Urban', 'Tamil_Nadu'),
  ('Kolkata', 14681000, 14600000, 22000, 10000, 85, 'MEDIUM', 22.5726, 88.3639, 'Urban', 'West_Bengal'),
  ('Pune', 6430000, 6380000, 14000, 6000, 60, 'HIGH', 18.5204, 73.8567, 'Urban', 'Maharashtra'),
  ('Ahmedabad', 8450000, 8400000, 10000, 4000, 40, 'LOW', 23.0225, 72.5714, 'Urban', 'Gujarat'),
  ('Hyderabad', 6809000, 6750000, 16000, 7000, 70, 'MEDIUM', 17.3850, 78.4867, 'Urban', 'Telangana'),
  ('Haryana', 25351462, 25200000, 20000, 9000, 80, 'MEDIUM', 29.0588, 77.0745, 'State', 'Delhi,Punjab,Uttar_Pradesh'),
  ('Kerala', 33387677, 33200000, 18000, 25000, 150, 'LOW', 10.8505, 76.2711, 'State', 'Tamil_Nadu,Karnataka');

-- Insert simulation results (completed simulations)
INSERT INTO simulations (source_region_id, infection_rate, recovery_rate, mortality_rate, total_days, current_day, mobility_factor, status, total_infected, total_recovered, total_deaths, peak_infections, peak_day, created_at, started_at, completed_at) VALUES
  (1, 0.15, 0.08, 0.02, 30, 30, 1.2, 'completed', 125000, 85000, 2500, 45000, 21, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 days'),
  (2, 0.18, 0.09, 0.025, 45, 45, 1.5, 'completed', 210000, 155000, 4200, 75000, 28, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 hours'),
  (3, 0.12, 0.07, 0.015, 30, 30, 1.0, 'completed', 95000, 72000, 1425, 35000, 18, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 hours'),
  (4, 0.10, 0.06, 0.01, 25, 12, 0.9, 'running', 45000, 22000, 225, 12000, 10, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NULL),
  (5, 0.16, 0.085, 0.022, 40, 40, 1.3, 'completed', 185000, 145000, 4070, 68000, 25, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '30 minutes');

-- Insert daily data for ongoing simulation (Chennai - Simulation 4)
INSERT INTO simulation_daily_data (simulation_id, day, susceptible, infected, recovered, deaths, new_infections, new_recoveries, new_deaths, spreading_regions) VALUES
  (4, 1, 7043000, 100, 0, 0, 100, 0, 0, 'Chennai'),
  (4, 2, 7041500, 850, 250, 2, 750, 250, 2, 'Chennai'),
  (4, 3, 7038200, 2800, 1100, 8, 1950, 850, 6, 'Chennai'),
  (4, 4, 7032100, 7500, 3200, 25, 4700, 2100, 17, 'Chennai,Tamil_Nadu'),
  (4, 5, 7020000, 15000, 8000, 60, 7500, 4800, 35, 'Chennai,Tamil_Nadu'),
  (4, 6, 7005000, 25000, 18000, 140, 10000, 10000, 80, 'Chennai,Tamil_Nadu,Karnataka'),
  (4, 7, 6985000, 32000, 28000, 250, 7000, 10000, 110, 'Chennai,Tamil_Nadu,Karnataka'),
  (4, 8, 6970000, 36000, 38000, 380, 4000, 10000, 130, 'Chennai,Tamil_Nadu,Karnataka'),
  (4, 9, 6958000, 38000, 47000, 520, 2000, 9000, 140, 'Chennai,Tamil_Nadu'),
  (4, 10, 6948000, 39000, 55000, 670, 1000, 8000, 150, 'Chennai,Tamil_Nadu'),
  (4, 11, 6940000, 40000, 62000, 800, 1000, 7000, 130, 'Chennai'),
  (4, 12, 6933000, 41000, 68000, 895, 1000, 6000, 95, 'Chennai');

-- Insert daily data for another completed simulation (Pune - Simulation 5)
INSERT INTO simulation_daily_data (simulation_id, day, susceptible, infected, recovered, deaths, new_infections, new_recoveries, new_deaths, spreading_regions) VALUES
  (5, 1, 6380000, 100, 0, 0, 100, 0, 0, 'Pune'),
  (5, 5, 6350000, 5000, 2000, 30, 4900, 2000, 30, 'Pune'),
  (5, 10, 6280000, 18000, 12000, 150, 13000, 10000, 120, 'Pune,Maharashtra'),
  (5, 15, 6180000, 42000, 35000, 420, 24000, 23000, 270, 'Pune,Maharashtra'),
  (5, 20, 6050000, 65000, 65000, 850, 23000, 30000, 430, 'Pune,Maharashtra'),
  (5, 25, 5920000, 68000, 95000, 1350, 3000, 30000, 500, 'Pune,Maharashtra'),
  (5, 30, 5825000, 55000, 125000, 1850, -13000, 30000, 500, 'Pune,Maharashtra'),
  (5, 35, 5750000, 35000, 155000, 2180, -20000, 30000, 330, 'Pune,Maharashtra'),
  (5, 40, 5700000, 12000, 185000, 2920, -23000, 30000, 740, 'Pune,Maharashtra');

-- Insert infection history (tracking regional progression)
INSERT INTO infection_history (region_id, simulation_id, day, susceptible, infected, recovered, deaths, severity) VALUES
  (1, 1, 15, 32800000, 45000, 30000, 800, 'HIGH'),
  (1, 1, 21, 32650000, 45000, 65000, 1200, 'CRITICAL'),
  (1, 1, 30, 32550000, 15000, 125000, 2500, 'LOW'),
  (2, 2, 10, 20900000, 50000, 8000, 300, 'HIGH'),
  (2, 2, 28, 20700000, 75000, 80000, 2800, 'CRITICAL'),
  (2, 2, 45, 20550000, 28000, 195000, 4200, 'MEDIUM'),
  (4, 4, 5, 7050000, 15000, 8000, 60, 'HIGH'),
  (4, 4, 10, 7000000, 35000, 45000, 350, 'CRITICAL'),
  (4, 4, 12, 6995000, 40000, 60000, 895, 'CRITICAL');

-- Insert resources
INSERT INTO resources (name, type, region, quantity, unit, status) VALUES
  ('ICU Beds - Holy Family Hospital', 'ICU_BEDS', 'Delhi', 250, 'beds', 'available'),
  ('Ventilators - Apollo', 'VENTILATORS', 'Delhi', 180, 'units', 'available'),
  ('PPE Kits - AIIMS', 'PPE_KITS', 'Delhi', 50000, 'units', 'available'),
  ('Oxygen Cylinders - Government Stock', 'OXYGEN', 'Delhi', 1200, 'cylinders', 'available'),
  ('Testing Kits - Ramdev Labs', 'TEST_KITS', 'Delhi', 100000, 'kits', 'available'),
  ('ICU Beds - Lilavati Hospital', 'ICU_BEDS', 'Mumbai', 320, 'beds', 'available'),
  ('Ventilators - Apollo Mumbai', 'VENTILATORS', 'Mumbai', 240, 'units', 'available'),
  ('PPE Kits - BMC Stock', 'PPE_KITS', 'Mumbai', 75000, 'units', 'available'),
  ('Oxygen Cylinders - Municipal', 'OXYGEN', 'Mumbai', 1500, 'cylinders', 'available'),
  ('Testing Kits - SRL', 'TEST_KITS', 'Mumbai', 150000, 'kits', 'available'),
  ('ICU Beds - Manipal', 'ICU_BEDS', 'Bangalore', 200, 'beds', 'available'),
  ('Ventilators - St. Johns', 'VENTILATORS', 'Bangalore', 150, 'units', 'available'),
  ('PPE Kits - BBMP', 'PPE_KITS', 'Bangalore', 60000, 'units', 'available'),
  ('Oxygen Cylinders - Industrial Supply', 'OXYGEN', 'Bangalore', 900, 'cylinders', 'available'),
  ('Testing Kits - Strand Labs', 'TEST_KITS', 'Bangalore', 120000, 'kits', 'available');

-- Insert resourceallocations
INSERT INTO allocations (region_id, simulation_id, resource_type, quantity, allocated_at, reason, severity) VALUES
  (1, 1, 'ICU_BEDS', 150, NOW() - INTERVAL '25 days', 'Peak infection response - Delhi outbreak', 'CRITICAL'),
  (1, 1, 'VENTILATORS', 120, NOW() - INTERVAL '23 days', 'Critical patient care - Delhi', 'CRITICAL'),
  (1, 1, 'PPE_KITS', 40000, NOW() - INTERVAL '24 days', 'Healthcare worker protection', 'HIGH'),
  (1, 1, 'OXYGEN', 600, NOW() - INTERVAL '22 days', 'Life support - Delhi hospitals', 'CRITICAL'),
  (2, 2, 'ICU_BEDS', 200, NOW() - INTERVAL '15 days', 'Mumbai outbreak peak response', 'CRITICAL'),
  (2, 2, 'VENTILATORS', 180, NOW() - INTERVAL '14 days', 'Critical care expansion', 'CRITICAL'),
  (2, 2, 'PPE_KITS', 60000, NOW() - INTERVAL '15 days', 'Healthcare capacity increase', 'CRITICAL'),
  (2, 2, 'OXYGEN', 900, NOW() - INTERVAL '13 days', 'High demand management', 'CRITICAL'),
  (3, 3, 'ICU_BEDS', 100, NOW() - INTERVAL '10 days', 'Bangalore preventive allocation', 'HIGH'),
  (3, 3, 'VENTILATORS', 80, NOW() - INTERVAL '10 days', 'Ventilator stockpile', 'HIGH'),
  (4, 4, 'ICU_BEDS', 120, NOW() - INTERVAL '5 days', 'Chennai ongoing crisis response', 'CRITICAL'),
  (4, 4, 'OXYGEN', 500, NOW() - INTERVAL '3 days', 'Real-time allocation', 'CRITICAL');

-- Insert faults (simulating system resilience issues)
INSERT INTO faults (severity, type, description, affected_service, status, created_at, resolved_at) VALUES
  ('HIGH', 'SERVICE_TIMEOUT', 'Simulation service responded slowly during peak load', 'simulation-service', 'resolved', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
  ('CRITICAL', 'DATABASE_LATENCY', 'Database query performance degradation', 'postgres', 'resolved', NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days'),
  ('MEDIUM', 'CONNECTION_POOL', 'Resource service connection pool exhaustion', 'resource-service', 'resolved', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
  ('HIGH', 'API_RATE_LIMIT', 'Gateway service rate limiting triggered', 'gateway-service', 'resolved', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'),
  ('MEDIUM', 'MEMORY_SPIKE', 'Simulation service memory usage spike', 'simulation-service', 'resolved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
  ('CRITICAL', 'NETWORK_PARTITION', 'Inter-service communication interrupted', 'event-bus', 'resolved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days'),
  ('HIGH', 'DATA_SYNC', 'Region data synchronization lag', 'region-service', 'open', NOW() - INTERVAL '6 hours', NULL);

-- Update resource inventory
INSERT INTO inventory (resource_type, total_available, reserved, allocated) VALUES
  ('ICU_BEDS', 1500, 300, 570),
  ('VENTILATORS', 1200, 200, 460),
  ('PPE_KITS', 500000, 50000, 230000),
  ('OXYGEN', 8000, 1000, 2900),
  ('TEST_KITS', 1000000, 100000, 500000);

-- Calculate priority scores for regions
INSERT INTO region_priority_scores (region_id, priority_score, infection_ratio, population_at_risk, resource_demand_level) VALUES
  (1, 0.85, 0.077, 2500000, 'CRITICAL'),
  (2, 0.92, 0.110, 2300000, 'CRITICAL'),
  (3, 0.68, 0.055, 750000, 'HIGH'),
  (4, 0.78, 0.085, 900000, 'CRITICAL'),
  (5, 0.72, 0.070, 850000, 'HIGH'),
  (6, 0.88, 0.130, 900000, 'CRITICAL'),
  (7, 0.55, 0.035, 450000, 'MEDIUM'),
  (8, 0.75, 0.095, 750000, 'HIGH'),
  (9, 0.65, 0.045, 800000, 'MEDIUM'),
  (10, 0.42, 0.025, 600000, 'LOW');

-- Log sample events
INSERT INTO events_log (event_type, source_service, payload) VALUES
  ('SIMULATION_STARTED', 'simulation-service', '{"simulation_id": 1, "region": "Delhi", "start_time": "2025-03-12T10:30:00Z"}'::jsonb),
  ('INFECTION_SPIKE', 'simulation-service', '{"region_id": 1, "new_infections": 45000, "severity": "CRITICAL"}'::jsonb),
  ('RESOURCE_ALLOCATED', 'resource-service', '{"resource_type": "ICU_BEDS", "quantity": 150, "region": "Delhi"}'::jsonb),
  ('SIMULATION_COMPLETED', 'simulation-service', '{"simulation_id": 1, "total_infected": 125000, "total_recovered": 85000}'::jsonb),
  ('FAULT_DETECTED', 'fault-service', '{"type": "SERVICE_TIMEOUT", "service": "simulation-service"}'::jsonb),
  ('SIMULATION_STARTED', 'simulation-service', '{"simulation_id": 4, "region": "Chennai", "current_day": 12}'::jsonb),
  ('INFECTION_ALERT', 'simulation-service', '{"region_id": 4, "infected_count": 40000, "trend": "rising"}'::jsonb),
  ('RESOURCE_REQUEST', 'gateway-service', '{"resource_needed": "OXYGEN", "region": "Chennai", "quantity": 500}'::jsonb);
