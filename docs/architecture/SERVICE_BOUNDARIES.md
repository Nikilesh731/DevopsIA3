# Service Boundaries & Responsibilities

Clear delineation of what each service owns, what it provides, and how it interacts with other services.

## Service Responsibility Matrix

| Responsibility | Owner | Consumers |
|---|---|---|
| Region CRUD | Region Service | Gateway, Dashboard |
| Region Connectivity Graph | Region Service | Simulation Service |
| Epidemic Progression | Simulation Service | Gateway, Dashboard |
| Infection Event Generation | Simulation Service | Event Bus, Resource Service |
| Resource Inventory | Resource Service | Gateway, Dashboard |
| Resource Allocation Algorithm | Resource Service | Gateway, Dashboard |
| Service Health Monitoring | Fault Service | Gateway, Dashboard |
| Event Aggregation & Logging | Event Bus | All Services |
| API Routing & Aggregation | Gateway | Frontend |

---

## Region Service (Port 5001)

### Owns (Responsibilities)
- Region entity lifecycle (create, read, update, delete)
- Region attributes: name, population, susceptible, infected, recovered, deaths, location
- Connectivity graph (which regions are adjacent)
- Persistence of region data
- Seeding demo regions with realistic data

### Provides (Public Interface)
```
GET    /api/regions               List all regions
POST   /api/regions               Create region
GET    /api/regions/:id           Get specific region
PUT    /api/regions/:id           Update region
DELETE /api/regions/:id           Delete region
GET    /api/regions/:id/neighbors Get connected regions
GET    /api/regions/connectivity  Get full connectivity matrix
GET    /health                    Health check
```

### Publishes Events
- `region.created`: When new region added with initial SIR state
- `region.updated`: When region properties change
- `region.deleted`: When region removed

### Consumes Events
- None (Region Service is independent)

### Data Model
```javascript
Region {
  id: UUID,
  name: String,
  population: Integer,
  susceptible: Integer,
  infected: Integer,
  recovered: Integer,
  deaths: Integer,
  connectedRegionIds: UUID[],
  latitude: Float,
  longitude: Float,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### Dependencies
- None (independent service)

### Startup Sequence
1. Initialize in-memory store
2. Load seed data (5-10 regions)
3. Build connectivity matrix
4. Expose health endpoint
5. Ready to accept requests

---

## Simulation Service (Port 5002)

### Owns (Responsibilities)
- Simulation entity lifecycle (create, start, pause, resume, stop, complete)
- Daily epidemic progression calculations (SIR model)
- Inter-region spread calculations
- Simulation state and history
- Day-by-day results

### Provides (Public Interface)
```
GET    /api/simulations           List simulations
POST   /api/simulations           Create simulation
GET    /api/simulations/:id       Get simulation details
POST   /api/simulations/:id/start Start simulation
POST   /api/simulations/:id/pause Pause simulation
POST   /api/simulations/:id/resume Resume simulation
POST   /api/simulations/:id/stop  Stop simulation
GET    /api/simulations/:id/log   Get day-by-day log
GET    /health                    Health check
```

### Publishes Events
- `simulation.started`: Simulation begins with parameters
- `simulation.day.advanced`: Each day iteration complete
- `simulation.paused`: Simulation paused
- `simulation.resumed`: Simulation continued
- `infection.detected`: First case in region
- `infection.updated`: Daily status in region
- `infection.spread`: Case spread to adjacent region
- `outbreak.declared`: Severity threshold crossed
- `simulation.completed`: Simulation finished

### Consumes Events
- `region.created`: To learn about new regions
- `resources.allocated`: (Optional) To adjust spread based on interventions

### Data Model
```javascript
Simulation {
  id: UUID,
  sourceRegionId: UUID,
  infectionRate: Float (0-1),
  recoveryRate: Float (0-1),
  mortalityRate: Float (0-1),
  totalDays: Integer,
  mobilityFactor: Float (connectivity impact),
  currentDay: Integer,
  status: Enum (pending|running|paused|completed|failed),
  regionStates: Map<RegionId, SIRState>,
  eventLog: Event[],
  createdAt: ISO8601,
  startedAt: ISO8601,
  completedAt: ISO8601
}

SIRState {
  regionId: UUID,
  day: Integer,
  susceptible: Integer,
  infected: Integer,
  recovered: Integer,
  deaths: Integer,
  severity: Enum (low|medium|high|critical)
}
```

### Algorithm
```
For each day in simulation:
  For each region:
    Calculate transitions:
      new_infected = infection_rate * S * I / population
      new_recovered = recovery_rate * I
      new_deaths = mortality_rate * I
      
    Update regional state:
      S' = S - new_infected
      I' = I + new_infected - new_recovered
      R' = R + new_recovered
      D' = D + new_deaths
    
    Handle spread to adjacent regions:
      For each connected region:
        if current_region.infected > 0:
          spread_count = new_infected * mobility_factor * connectivity
          adjacent_region.infected += spread_count
  
  Emit infection.updated events for all regions
  Emit infection.spread events for cross-region transmission
  Check for outbreak thresholds, emit outbreak.declared if triggered
```

### Dependencies
- Region Service (for connectivity data)
- Event Bus (for event publishing)

### Interaction Pattern
```
1. Frontend requests: POST /api/simulations/123/start
2. Simulation Service validates parameters
3. Calls GET /api/regions to retrieve region data
4. Calls GET /api/regions/connectivity to build graph
5. Begins loop:
   - Calculate daily changes
   - Publish events: infection.updated, infection.spread
   - Wait for Event Bus to confirm (optional)
   - Move to next day
6. On completion: Publish simulation.completed
```

---

## Resource Service (Port 5003)

### Owns (Responsibilities)
- Resource inventory (beds, vaccines, oxygen, medical teams)
- Resource allocation algorithm
- Shortage detection
- Allocation history and audit trail
- Demand calculation based on infection severity

### Provides (Public Interface)
```
GET    /api/resources             List current inventory
GET    /api/resources/:regionId   Get region inventory
POST   /api/resources/:regionId/allocate  Manual allocation
GET    /api/resources/shortages   List shortage alerts
GET    /api/resources/:regionId/history   Allocation history
GET    /health                    Health check
```

### Publishes Events
- `resources.requested`: Demand calculated
- `resources.allocated`: Resources allocated to region
- `shortage.detected`: Critical shortage alert
- `shortage.resolved`: Shortage cleared

### Consumes Events
- `infection.detected`: Region has cases, calculate demand
- `infection.updated`: Demand recalculation based on new state
- `simulation.day.advanced`: Daily inventory consumption
- `region.created`: New region enters inventory system

### Data Model
```javascript
RegionInventory {
  regionId: UUID,
  beds: Integer,
  vaccines: Integer,
  oxygen: Integer,
  medicalTeams: Integer,
  lastUpdated: ISO8601
}

AllocationHistory {
  id: UUID,
  regionId: UUID,
  simulationId: UUID,
  allocatedAt: ISO8601,
  beds: Integer,
  vaccines: Integer,
  oxygen: Integer,
  reason: String,
  severity: Enum (low|medium|high|critical)
}

ResourceDemand {
  regionId: UUID,
  infectedCount: Integer,
  severity: Enum (low|medium|high|critical),
  bedsRequired: Integer,
  vaccinesRequired: Integer,
  oxygenRequired: Integer,
  priority: Float (0-100)
}
```

### Allocation Strategy
```
For each region with infection:
  1. Calculate demand based on severity:
     beds_needed = infected_count * severity_weight * hospitalization_rate
     vaccines_needed = infected_count * vaccination_rate
     oxygen_needed = infected_count * oxygen_rate
  
  2. Calculate priority score:
     priority = (severity * 0.3) + (infected_count / total_infected * 0.4) + (shortage_risk * 0.3)
  
  3. Allocate proportionally:
     regional_share = priority / sum_all_priorities
     beds_allocated = available_beds * regional_share
     (same for vaccines, oxygen)
  
  4. Detect shortages:
     if demand > available:
       publish shortage.detected event
       log allocation failure
```

### Dependencies
- Event Bus (for event consumption)
- Simulation Service (indirectly, via events)

### Interaction Pattern
```
Simulation publishes infection.updated event
         ↓
Resource Service consumes event
         ↓
Queries Event Bus for current infection state
         ↓
Calculates demand based on severity
         ↓
Publishes resources.requested event
         ↓
Allocates from available inventory
         ↓
Publishes resources.allocated event (or shortage.detected)
         ↓
Updates internal inventory state
```

---

## Fault Service (Port 5004)

### Owns (Responsibilities)
- Service health monitoring
- Fault injection and simulation
- Failure tracking and logging
- Recovery tracking and metrics
- Circuit breaker state management
- Retry logic and backoff

### Provides (Public Interface)
```
GET    /api/faults                List all faults
POST   /api/faults                Inject fault manually
GET    /api/faults/:id            Get fault details
POST   /api/faults/:id/recover    Force recovery
GET    /api/faults/health         System health status
GET    /api/faults/health/:service Service-specific health
GET    /health                    Health check
```

### Publishes Events
- `service.failed`: Service failure detected
- `service.recovered`: Service recovery confirmed
- `health.check`: Periodic health status
- `health.check.failed`: Health check failed

### Consumes Events
- All events (for observability and correlation)

### Data Model
```javascript
ServiceHealth {
  serviceName: String,
  status: Enum (healthy|degraded|unhealthy),
  lastCheckTime: ISO8601,
  responseTimeMs: Integer,
  failureCount: Integer,
  circuitBreakerState: Enum (closed|open|half-open)
}

Fault {
  id: UUID,
  serviceName: String,
  faultType: Enum (unavailable|slow|error|cascading),
  severity: Enum (low|medium|high|critical),
  reason: String,
  injectedAt: ISO8601,
  recoveredAt: ISO8601,
  durationMs: Integer,
  retryAttempts: Integer,
  status: Enum (active|resolved|cascading)
}

HealthLog {
  timestamp: ISO8601,
  serviceName: String,
  status: Enum (healthy|degraded|unhealthy),
  responseTimeMs: Integer,
  endpoint: String,
  statusCode: Integer
}
```

### Health Check Logic
```
Every 10 seconds:
  For each service endpoint:
    1. Send HTTP request with 3-second timeout
    2. Measure response time
    3. Check status code
    
    if response OK:
      record healthy status
      reset failure count
    else or timeout:
      increment failure count
      service_health = update_circuit_breaker(failure_count)
      
      if circuit_breaker.open:
        publish service.failed event
        set retry_at = now + 60 seconds
      else if circuit_breaker.half_open:
        try_recovery()
```

### Dependencies
- Event Bus (for publishing health events)
- All Services (for health probes)

### Interaction Pattern
```
1. On startup:
   - Register health check endpoints for each service
   - Initialize circuit breakers (all closed)
   - Start health check loop
2. Every 10 seconds:
   - Probe each service
   - Record response times
   - Update circuit states
   - Publish health.check events
3. On failure:
   - Open circuit breaker
   - Publish service.failed event
   - Notify gateway
   - Track affected endpoints
4. On recovery:
   - Transition to half-open
   - Test recovery
   - Close circuit breaker on success
   - Publish service.recovered event
```

---

## Event Bus Service (Port 5005)

### Owns (Responsibilities)
- Event acceptance and validation
- Event persistence (bounded history)
- Event stream provision
- Event filtering and querying
- Subscriber management (for future implementations)

### Provides (Public Interface)
```
POST   /api/events                Publish event
GET    /api/events/stream         Get event stream (with filter)
GET    /api/events/:eventType     Get events by type
DELETE /api/events/history/clear  Clear history (admin)
GET    /health                    Health check
```

### Publishes Events
- `event.log.created`: Meta-event when event logged

### Consumes Events
- All events (receives and logs everything)

### Data Model
```javascript
Event {
  eventType: String,
  timestamp: ISO8601,
  // Dynamic ID fields
  regionId?: UUID,
  simulationId?: UUID,
  serviceName?: String,
  // Core data
  data: Object,
  // Added by event bus
  receivedAt: ISO8601,
  sequence: Integer
}

EventLog {
  inMemoryHistory: Event[] (max 10,000),
  startTime: ISO8601,
  eventCount: Integer,
  subscriberCount: Integer
}
```

### Event Flow
```
Service publishes event
         ↓
POST /api/events with event payload
         ↓
Event Bus validates schema
         ↓
Event Bus stores in circular buffer
         ↓
Event Bus logs to stdout
         ↓
Response 201 Created (no subscribers need notification)
         ↓
Consumers poll /api/events/stream to retrieve
```

### Dependencies
- None (independent service)

---

## Gateway Service (Port 5000)

### Owns (Responsibilities)
- Request routing to backend services
- Response aggregation
- Error handling and transformation
- Request logging
- API versioning (future)

### Provides (Public Interface)
```
All /api/* routes
  - Proxied to appropriate backend service
  - Response aggregated and transformed
```

### Publishes Events
- None (passes through service events)

### Consumes Events
- None (stateless proxy)

### Data Model
```javascript
RouteMapping {
  path: String (regex),
  service: String (name),
  method: String (HTTP method),
  timeout: Integer (milliseconds)
}

Response {
  success: Boolean,
  data?: object,
  error?: String,
  statusCode: Integer,
  timestamp: ISO8601,
  service: String (which service responded)
}
```

### Routing Logic
```
1. Request arrives at gateway
2. Match request path to route mapping
3. Determine target service and endpoint
4. Transform request for backend service
5. Send request with timeout and retry logic
6. Receive response from service
7. Transform response to standard format
8. Return to client
```

### Dependencies
- All backend services (for routing)
- Event Bus (for health observation, optional)

---

## Communication Patterns

### Synchronous (Request-Response)
Used when: Immediate response required, state must be consistent

```
Frontend → Gateway → Service → Database
              ↓         ↓         ↓
            response ← response ← data
```

### Asynchronous (Event-Driven)
Used when: Action triggered by state change, eventual consistency acceptable

```
Service A (publishes)
    ↓
Event Bus (persists & logs)
    ↓
Service B (consumes, when ready)
```

### No Direct Service-to-Service Communication
Services do NOT call each other directly. All communication goes through:
1. Gateway (for frontend requests)
2. Event Bus (for event publishing/consumption)
3. HTTP to Event Bus to retrieve shared state

---

## Idempotency & Consistency

### Idempotent Operations
- GET requests (safe)
- POST with idempotency key (for payment-like ops, not implemented)
- PUT requests (replacing state)

### Eventual Consistency
- Region creation event published → other services see new region
- May take milliseconds to propagate
- Dashboard uses polling for fresh data

### Conflict Resolution
- Last-write-wins for region updates
- Resource allocation uses timestamp ordering
- Simulation state immutable during progress

---

## Error Handling

### HTTP Status Codes
- 200 OK: Request succeeded
- 201 Created: Resource created
- 400 Bad Request: Invalid input
- 404 Not Found: Resource not found
- 500 Internal Server Error: Service error
- 503 Service Unavailable: Service down

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "error_detail"
  },
  "timestamp": "ISO8601"
}
```

---

**Last Updated**: April 10, 2026
