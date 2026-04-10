# PostgreSQL Setup Guide for Epidemic Simulation System

## Prerequisites

1. **PostgreSQL 13+** installed and running
2. **Node.js 18+** with npm
3. **pg** npm package (will be installed automatically)

## Quick Setup

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Run the installer and remember the password for postgres user
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database and User

Open PostgreSQL terminal:

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql console, run:
CREATE USER epidemic_user WITH PASSWORD 'epidemic_password';
CREATE DATABASE epidemic_simulation OWNER epidemic_user;

# Grant privileges
ALTER ROLE epidemic_user WITH CREATEDB;

# Verify
\l  -- List databases
\du -- List users

# Exit
\q
```

### Step 3: Update Environment Variables

Copy and edit `.env` file (already created):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=epidemic_user
DB_PASSWORD=epidemic_password
DB_NAME=epidemic_simulation
```

### Step 4: Install Dependencies

```bash
cd region-service && npm install
cd ../resource-service && npm install
```

### Step 5: Initialize Database Schema

```bash
# From project root
node shared/db/init.js
```

Output should show:
```
Initializing database schema...
✓ Database schema created successfully
✓ Initial data seeded
```

### Step 6: Start Services

```bash
# Terminal 1: Event Bus
cd services/event-bus && npm start

# Terminal 2: Region Service (with PostgreSQL)
cd region-service && npm start

# Terminal 3: Resource Service
cd resource-service && npm start

# Terminal 4: All other services...
```

## Database Schema Overview

### Tables

**regions**
- Stores region data with SIR model states
- Priority scores calculated and cached
- Includes infection history tracking

**infection_history**
- Daily snapshots of region infection data
- Used for trend analysis and historical queries

**allocations**
- Resource allocation records with timestamps
- Linked to regions and simulations

**inventory**
- Current resource availability
- Updated on allocations

**region_priority_scores**
- Cached priority calculations
- Recalculated when infection data changes
- Used for sorting and filtering

## Priority Score Algorithm

The system calculates a priority score (0-100) for each region based on:

1. **Infection Ratio (40%)**
   - Infected / Population as percentage
   - Higher infection → Higher priority

2. **Population at Risk (30%)**
   - (Infected + Susceptible) / Population
   - Larger at-risk population → Higher priority

3. **Resource Demand Level (30%)**
   - CRITICAL: 100 points (infection ratio > 10%)
   - HIGH: 75 points (infection ratio > 5%)
   - MEDIUM: 50 points (infection ratio > 1%)
   - LOW: 25 points (infection ratio ≤ 1%)

**Example:**
```
Region: South District
- Population: 600,000
- Infected: 12
- Susceptible: 588,000

Infection Ratio: 12/600,000 = 0.002 = 0.2%
Population at Risk: 600,000/600,000 = 100%
Resource Demand: MEDIUM (50 points)

Priority Score = (0.2 * 0.4) + (100 * 0.3) + (50 * 0.3)
              = 0.08 + 30 + 15
              = 45.08 / 100
```

## Testing the Setup

### Test Database Connection

```bash
psql -U epidemic_user -d epidemic_simulation

# In psql:
SELECT COUNT(*) FROM regions;
SELECT * FROM region_priority_scores;
\q
```

### Test API Endpoints

```bash
# After services are running

# Get regions with priority scores
curl http://localhost:5001/api/regions

# Get analytics
curl http://localhost:5001/api/regions/analytics

# Get high-priority regions
curl http://localhost:5001/api/regions/analytics/priority

# Update infection and recalculate priority
curl -X PUT http://localhost:5001/api/regions/1/infect \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED
```
- Ensure PostgreSQL is running: `psql -U postgres`
- Check DB_HOST and DB_PORT in .env
- Verify firewall rules

### Authentication Failed
```
Error: role "epidemic_user" does not exist
```
- Run the CREATE USER command again
- Check .env credentials match

### Database Not Found
```
Error: database "epidemic_simulation" does not exist
```
- Run database initialization: `node shared/db/init.js`
- Verify database was created: `psql -U postgres -l`

### Port Already in Use
```
Error: listen EADDRINUSE
```
- Check if another service is running: `netstat -an | grep 5001`
- Kill process: `lsof -ti:5001 | xargs kill -9`

## Performance Optimization

For production, consider:

1. **Connection Pooling**
   - Already configured in database.js
   - Adjust DB_POOL_SIZE based on load

2. **Indexing**
   - Already created on common query fields
   - Add more as needed based on usage

3. **Query Optimization**
   - Use EXPLAIN ANALYZE for slow queries
   - Profile with pg_stat_statements

4. **Archival**
   - Archive old infection_history records
   - Keep recent data in main table

## Backup and Restore

### Backup Database

```bash
pg_dump -U epidemic_user -d epidemic_simulation > backup.sql
```

### Restore Database

```bash
psql -U epidemic_user -d epidemic_simulation < backup.sql
```

---

**For more help:** See ERROR section in troubleshooting guide
