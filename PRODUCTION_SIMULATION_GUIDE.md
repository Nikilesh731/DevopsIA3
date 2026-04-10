# Production-Level Epidemic Simulation System

## Overview

This is a **production-grade microservices-based epidemic simulation system** with Indian regional data. It uses a realistic **SIR (Susceptible-Infected-Recovered)** epidemiological model to simulate disease spread across 28 Indian states and union territories.

## Architecture

### Service Components

1. **Simulation Service** (Port 5002)
   - Runs day-by-day SIR epidemic model
   - Tracks region-to-region spread
   - Stores complete simulation history
   - Provisions resources based on demand

2. **Region Service** (Port 5001)
   - Manages Indian region data
   - Tracks infection metrics
   - Calculates priority scores
   - Maintains regional connectivity graph

3. **Resource Service** (Port 5003)
   - Allocates beds, vaccines, oxygen
   - Tracks inventory consumption
   - Reports demand levels

4. **Fault Service** (Port 5004)
   - Monitors system health
   - Injects faults for testing
   - Simulates infrastructure failures

5. **Event Bus** (Port 5005)
   - Publishes simulation events
   - Enables cross-service communication
   - Stores event history

6. **Gateway Service** (Port 5000)
   - Single API entry point
   - Proxies requests to microservices
   - Aggregates dashboard data
   - Manages authentication/routing

## Database Schema

### Tables

#### Regions
```sql
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  population INTEGER,
  susceptible INTEGER,
  infected INTEGER,
  recovered INTEGER,
  deaths INTEGER,
  risk_level VARCHAR(50),
  latitude FLOAT,
  longitude FLOAT,
  region_type VARCHAR(20),
  connected_regions TEXT, -- JSON list of neighboring regions
  last_update_day INTEGER
);
```

#### Simulations
```sql
CREATE TABLE simulations (
  id SERIAL PRIMARY KEY,
  source_region_id INTEGER REFERENCES regions(id),
  infection_rate FLOAT,
  recovery_rate FLOAT,
  mortality_rate FLOAT,
  total_days INTEGER,
  current_day INTEGER,
  mobility_factor FLOAT,
  status VARCHAR(50), -- pending, running, completed, failed
  total_infected INTEGER,
  total_recovered INTEGER,
  total_deaths INTEGER,
  peak_infections INTEGER,
  peak_day INTEGER,
  created_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

#### Simulation Daily Data
```sql
CREATE TABLE simulation_daily_data (
  id SERIAL PRIMARY KEY,
  simulation_id INTEGER REFERENCES simulations(id),
  day INTEGER,
  susceptible INTEGER,
  infected INTEGER,
  recovered INTEGER,
  deaths INTEGER,
  spreading_regions TEXT -- JSON array of regions with new infections
);
```

## API Endpoints

### Simulation Control

**Create Simulation**
```http
POST /api/simulation/create
Content-Type: application/json

{
  "sourceRegionId": 1,
  "infectionRate": 0.15,
  "recoveryRate": 0.10,
  "mortalityRate": 0.02,
  "totalDays": 180,
  "mobilityFactor": 1.0
}
```

**Start Simulation**
```http
POST /api/simulation/:id/run
```

**Get Results**
```http
GET /api/simulation/:id/results
```

**List Simulations**
```http
GET /api/simulations
```

### Region Data

```http
GET /api/regions
GET /api/regions/analytics
GET /api/regions/analytics/priority
```

### Resources

```http
GET /api/resources
GET /api/resources/allocation
POST /api/resources/allocate
```

## Epidemic Model

### SIR Compartments

- **S (Susceptible)**: Can contract disease
- **I (Infected)**: Contagious, can transmit
- **R (Recovered/Dead)**: No longer infectious

### Mathematical Model

Daily infections are calculated using:
```
λ = 1 - e^(-(β * C * I) / N)
New I = S * λ
```

Where:
- **β** = infectionRate (transmission probability per contact)
- **C** = contactRate * mobilityFactor (average contacts per day)
- **I** = current infected count
- **N** = population
- **S** = susceptible population

### Parameters

| Parameter | Default | Range | Meaning |
|-----------|---------|-------|---------|
| infectionRate | 0.15 | 0-1 | Daily transmission probability |
| recoveryRate | 0.10 | 0-1 | 1/infectious period (days) |
| mortalityRate | 0.02 | 0-1 | Case fatality rate |
| mobilityFactor | 1.0 | 0-2 | Travel/movement multiplier |
| totalDays | 180 | 1-365 | Simulation duration |

## Indian Regions Included

**28 States & Union Territories:**

### Northern Region
- Delhi, Haryana, Punjab, Himachal Pradesh, Jammu & Kashmir

### Eastern Region
- West Bengal, Bihar, Jharkhand, Odisha, Assam, Meghalaya, Tripura, Mizoram, Manipur, Nagaland, Sikkim, Arunachal Pradesh

### Central Region
- Madhya Pradesh, Chhattisgarh

### Western Region
- Gujarat, Rajasthan, Maharashtra, Goa

### Southern Region
- Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala

### Northern Plains
- Uttar Pradesh

## Using the System

### 1. Initialize Database

```bash
# With Docker
docker-compose exec simulation-service npm run init-db

# Or directly
node shared/db/init.js
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Create & Run Simulation

```javascript
// Step 1: Create simulation
const simResponse = await fetch('/api/simulation/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceRegionId: 1, // Delhi
    infectionRate: 0.15,
    recoveryRate: 0.10,
    mortalityRate: 0.02,
    totalDays: 180,
    mobilityFactor: 1.0
  })
});

const sim = await simResponse.json();
const simulationId = sim.data.id;

// Step 2: Run simulation
const runResponse = await fetch(`/api/simulation/${simulationId}/run`, {
  method: 'POST'
});

// Step 3: Get results
const resultsResponse = await fetch(`/api/simulation/${simulationId}/results`);
const results = await resultsResponse.json();
console.log(results.data);
```

### 4. View Results in Dashboard

Visit `http://localhost:3000` and navigate to **Simulation** page:
- Select source region
- Adjust epidemic parameters
- Run simulation
- View results with:
  - Peak infections
  - Death toll
  - Regional breakdown
  - Day-by-day timeline
  - Infection curve

## Resource Management

### Resource Types
- `beds`: Hospital bed capacity
- `icuBeds`: Intensive care unit beds
- `vaccines`: Doses available
- `oxygen`: Cylinders/units
- `ventilators`: Mechanical ventilators
- `PPE`: Personal protective equipment

### Allocation Strategy
Resources are allocated based on:
1. **Severity Level** (LOW, MEDIUM, HIGH, CRITICAL)
2. **Population at Risk**
3. **Infection Rate** (new infections per day)
4. **Available Inventory**

## Event Flow

### Simulation Events

1. **SIMULATION.CREATED**
   - New simulation instantiated
   - Parameters stored

2. **SIMULATION.DAY_COMPLETE**
   - Sent after each day of simulation
   - Contains regional snapshots

3. **SIMULATION.COMPLETE**
   - Final results aggregated
   - Peak metrics calculated

4. **RESOURCE.ALLOCATED**
   - Resource allocation event
   - Region and demandlevel included

## Monitoring & Metrics

### Dashboard Summary
```http
GET /api/dashboard/summary
```

Returns:
- Total regions affected
- Total infections
- Resource allocations
- Services status

### Health Checks
```http
GET /health
GET /api/health
```

All services must respond with status: UP

## Performance Considerations

- **Scale**: 28 regions, up to 180 days = realistic simulation
- **Computation**: Day-by-day calculations with network spread
- **Storage**: Each day stores complete snapshot (28 regions × 2KB ≈ 56KB/day)
- **Load**: Low compute - Python/Node can handle 100+ concurrent simulations

## Production Deployment

### Docker Stack
```bash
# Build all images
docker-compose build

# Run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes (Docker Desktop)
```bash
# Deploy
kubectl apply -f infra/kubernetes/

# Check status
kubectl get all -n epidemic-system

# Scale simulations
kubectl scale deployment simulation-service --replicas=3 -n epidemic-system
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=epidemic_user
DB_PASSWORD=epidemic_password
DB_NAME=epidemic_simulation
DB_POOL_SIZE=10

PORT=5000
REGION_SERVICE_URL=http://region-service:5001
SIMULATION_SERVICE_URL=http://simulation-service:5002
RESOURCE_SERVICE_URL=http://resource-service:5003
```

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
# 10 concurrent simulations
npm run test:load -- --concurrent 10 --duration 60
```

## Troubleshooting

### Simulations Running Slow
- Check DB connection pooling
- Verify PostgreSQL indexing
- Monitor CPU usage

### Region Data Not Updating
- Verify `connected_regions` JSON format
- Check region IDs in foreign keys
- Review simulation day logic

### Resource Allocation Failing
- Ensure inventory table populated
- Check resource type names match
- Verify allocation formula logic

## Epidemiological References

Model based on:
- **SIR Model**: Kermack-McKendrick (1927)
- **COVID-19 Parameters**: WHO, CDC studies
- **Indian Data**: 2011 Census, ICMR reports

## Future Enhancements

1. **Vaccination Campaign Impact**
   - Track vaccination rates
   - Model herd immunity threshold
   - Include vaccine effectiveness

2. **Intervention Strategies**
   - Social distancing effects
   - Lockdown impact modeling
   - Policy scenario testing

3. **Real Data Integration**
   - Historical infection data
   - Model calibration
   - Validation against real outbreaks

4. **WebSocket Live Updates**
   - Real-time simulation progress
   - Live dashboard updates
   - Multi-user collaboration

5. **Advanced Visualization**
   - Animated regional spread on map
   - 3D infection curves
   - Comparative scenario analysis

## License

MIT License - Educational Use

## Authors

- Distributed Computing IA3 Project Team
- Based on epidemiological research and microservices architecture best practices
