-- Insert sample events after database initialization
INSERT INTO events_log (event_type, source_service, payload) VALUES
  ('SIMULATION_STARTED', 'simulation-service', '{"simulation_id": 1, "region": "Delhi"}'::jsonb),
  ('INFECTION_SPIKE', 'simulation-service', '{"region_id": 1, "new_infections": 45000}'::jsonb),
  ('RESOURCE_ALLOCATED', 'resource-service', '{"resource_type": "ICU_BEDS", "quantity": 150}'::jsonb),
  ('SIMULATION_COMPLETED', 'simulation-service', '{"simulation_id": 1, "total_infected": 125000}'::jsonb),
  ('FAULT_DETECTED', 'fault-service', '{"type": "SERVICE_TIMEOUT"}'::jsonb),
  ('INFECTION_ALERT', 'simulation-service', '{"region_id": 4, "infected_count": 40000}'::jsonb);
