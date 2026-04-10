# System Architecture# System Architecture

































































































































































































































































































































































**Last Updated**: April 10, 2026---- [API Documentation](../api/)- [Deployment Guide](DEPLOYMENT_GUIDE.md)- [Service Boundaries](SERVICE_BOUNDARIES.md)- [Event Contracts](EVENT_CONTRACTS.md)## Documentation References- Multi-service coordination- Dashboard display- Full simulation execution### End-to-End Tests- API contract validation- Event publishing and consumption- Service-to-service communication### Integration Tests- SIR model calculations- Allocation algorithm logic- Event schema validation### Unit Tests## Testing Strategy- Event causality tracking- Distributed tracing headers- Request ID propagation### Tracing (Future)- Resource utilization- Error rates- Event throughput- Service latency### Metrics (Future)- Event logging with full context- Service name, timestamp, level in each message- Structured JSON logs to stdout### Logging## Monitoring & Observability```└── Services: Internal & External├── ReplicaSet: frontend (2)├── ReplicaSet: fault (2)├── ReplicaSet: resource (2)├── ReplicaSet: simulation (2)├── ReplicaSet: region (2)├── ReplicaSet: gateway (2-3)├── ReplicaSet: event-bus (1)├── Namespace: epidemic-systemKubernetes Cluster```### Production (Kubernetes)```└── Container: frontend (3000)├── Container: fault (5004)├── Container: resource (5003)├── Container: simulation (5002)├── Container: region (5001)├── Container: gateway (5000)├── Container: event-bus (5005)Host Machine```### Development (docker-compose)## Deployment Architecture- Total system: ~400MB with all services- Event history: ~10MB for 10,000 events- Node.js service: ~50MB RAM### Resource Consumption- Event bus: handles 1000+ events/second (in-memory)- Multi-region: linear scaling with region count- Single region: supports thousands of simulations### Scalability- Database queries: negligible (in-memory)- Event processing: 0-50ms- Inter-service: 1-10ms (local)### Latency## Performance Characteristics- RBAC (Role-Based Access Control)- HTTPS/TLS- Input validation- Rate limiting- API key management- OAuth 2.0 integration- JWT authentication### Production Additions Needed- No rate limiting- CORS enabled- No authorization- No authentication### Current Implementation (Development)## Security Considerations- Event streaming (Kafka/RabbitMQ)- Redis for caching- PostgreSQL for production- SQLite for local development### Future Enhancements- Resource tracking in memory- Simulation state in memory- Region data in memory- Event history in Event Bus (circular buffer, max 10,000 events)### Current Implementation (In-Memory)## Data Storage```     └─────────────┘     │   CLOSED    │     ┌──────▼──────┐            │ success     └────────────────┘     │  (recovering)   │     │  HALF-OPEN      │  (test recovery)     ┌──────▼──────────┐            │ timeout elapsed     └──────┬──────┘     │  (failing)  │     │    OPEN     │  (stop requests)     ┌──────▼──────┐            │ failure threshold reached     └──────┬──────┘     │  (working)  │     │   CLOSED    │  (normal operation)     ┌─────────────┐```### Circuit Breaker States- Circuit breaker for persistent failures- Max 3 attempts for transient failures- Exponential backoff (100ms → 5s)### Retry Logic- Alerts on failures- Fault Service monitors endpoints- Periodic health endpoints on all services### Health Checks## Resilience Patterns```    - Dashboard displays results    - Frontend polls event stream    - Publish "simulation.completed"10. Simulation complete                        │   - Events logged to Event Bus   - Fault Service monitors health   - Publish "resources.allocated" events   - Allocation Engine processes requests   - Publish "resources.requested" events   - Resource Service reacts to demand   - Publish "infection.updated" events   - Calculate infection progression9. For each day:                        │8. Simulation Service begins day iteration                        │7. Resource Service subscribes, prepares resources                        │6. Event Bus notifies subscribed services                        │5. Event Bus receives and logs event                        │4. Publishes "simulation.started" event                        │3. Simulation Service validates parameters                        │2. Gateway routes to Simulation Service                        │1. Frontend calls POST /api/simulations```### Scenario: Start Simulation## Data Flow Sequence| **Service Health** | `service.failed`, `service.recovered`, `health.check` || **Resources** | `resources.requested`, `resources.allocated`, `shortage.detected` || **Infection** | `infection.detected`, `infection.updated`, `infection.spread`, `outbreak.declared` || **Simulation** | `simulation.started`, `simulation.day.advanced`, `simulation.completed` || **Region Lifecycle** | `region.created`, `region.updated`, `region.deleted` ||----------|--------|| Category | Events |### Event Types```   │   (retrieve history)    │  (if polling)        │   │<────────────────────────│<─────────────────────│   │                    GET /api/events/stream      │   │                         │                      │   │                    <make available in stream>  │   │                         │                      │   │                         ├─────────────────────>│ (if subscribed)   │                    <notify subscribers>        │   │                         │                      │   │                    <store & log>               │   │  (publish event)        │                      │   ├──POST /api/events──────>│                      │   │                        │                      │Service A                Event Bus              Service B```### Event Flow## Event-Driven Communication- Enable observability across system- Provide polling-based event stream- Expose event history- Log events persistently- Receive events from all services**Responsibility**: Central event aggregation and logging### 6. Event Bus Service (Port 5005)- Cascading (affects other services)- Error (bad responses)- Slow (response delays)- Unavailable (service down)**Fault Types**:- Implement circuit breaker patterns- Log resilience patterns- Track service recovery- Inject failures for testing- Monitor health of all services**Responsibility**: Service health monitoring and resilience### 5. Fault Service (Port 5004)- Weighted by infected population- Demand-driven (shortage regions prioritized)- Severity-based (high-severity regions get priority)**Allocation Strategy**: - Maintain allocation history- Detect and alert on shortages- Allocate resources by priority- Calculate resource demand based on infection- Track resource availability (beds, vaccines, oxygen)**Responsibility**: Medical resource management### 4. Resource Service (Port 5003)```D(t+1) = D(t) + (mortality_rate * I(t))R(t+1) = R(t) + (recovery_rate * I(t))I(t+1) = I(t) + (infection_rate * S(t) * I(t) / population) - (recovery_rate * I(t))S(t+1) = S(t) - (infection_rate * S(t) * I(t) / population)```**SIR Model**:- Store simulation state and history- Publish simulation events- Calculate inter-region spread based on connectivity- Apply SIR (Susceptible-Infected-Recovered) model- Execute day-by-day disease progression**Responsibility**: Epidemic progression engine### 3. Simulation Service (Port 5002)```}  longitude: -74.0060  latitude: 40.7128,  connectedRegionIds: ["uuid1", "uuid2"],  deaths: 0,  recovered: 0,  infected: 500,  susceptible: 999500,  population: 1000000,  name: "Region name",  id: "uuid",{```javascript**Data Model**:- Seed initial region data for simulations- Publish `region.*` events- Maintain region state (population, susceptible, infected, recovered)- Manage region connectivity (adjacency graph)- Create, read, update regions**Responsibility**: Region management and connectivity### 2. Region Service (Port 5001)- `POST /api/*` - Proxy to backend services- `GET /health` - Service health check**Key Endpoints**:- Exposes unified `/api/*` interface- Implements error handling and middleware- Aggregates responses- Routes to appropriate backend services- Receives all client requests**Responsibility**: API routing and request aggregation### 1. Gateway Service (Port 5000)## Microservices```     └──────────────────┘     │  Event Logging   │     │  Event History   │     │  Bus (In-Memory) │     │  Event-Driven    │     ┌────────▼─────────┐              │     └────────┼────────┼────────┼────────┘     │        │        │        │        │  └──┬──┘ └──┬──┘ └───┬──┘ └───┬──┘ └───┬──┘  │5001     │5002      │5003    │5004     │5005  │Service  │Service   │Service │Service  │Bus  │Region   │Sim       │Res     │Fault    │Events  ┌──▼──┐ ┌──▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼──┐     │        │        │         │          │└────┬────────┬────────┬─────────┬──────────┬─────────────────┘│        (Request routing, aggregation, load balancing)       ││              Gateway Service (Port 5000)                    │┌─────────────▼───────────────────────────────────────────────┐              │ HTTP(S)└─────────────┬───────────────────────────────────────────────┘│                   http://localhost:3000                     ││                     Frontend (React)                        │┌─────────────────────────────────────────────────────────────┐```## Architecture LayersThe Distributed Epidemic Simulation and Resource Allocation System is a production-grade distributed system designed to simulate pandemic spread across interconnected regions while managing critical medical resources.## Overview
## Overview

The Distributed Epidemic Simulation and Resource Allocation System is a microservices-based application built on event-driven architecture principles. The system simulates disease spread across interconnected regions while managing medical resources and monitoring service health.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Dashboard                           │
│                    (React + Vite, Port 3000)                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│         Gateway Service (Port 5000)                               │
│       Unified API Routing & Request Aggregation                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Routes: /api/regions, /api/simulations, /api/resources,   │  │
│  │         /api/faults, /api/events, /api/dashboard          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────┬──────────────┬──────────────┬──────────────┬───────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐
│   Region     │ │ Simulation   │ │ Resource   │ │    Fault     │
│  Service     │ │  Service     │ │  Service   │ │   Service    │
│ (Port 5001)  │ │ (Port 5002)  │ │(Port 5003) │ │ (Port 5004)  │
├──────────────┤ ├──────────────┤ ├────────────┤ ├──────────────┤
│ • Create     │ │ • Run SIR    │ │• Track     │ │• Monitor     │
│   regions    │ │  model       │ │ inventory  │ │  health      │
│ • Manage     │ │• Calculate   │ │• Allocate  │ │• Inject      │
│   connectivity│ │ spread      │ │ resources  │ │ failures     │
│ • Store      │ │• Emit       │ │• Detect    │ │• Track       │
│   adjacency  │ │ infection   │ │ shortages  │ │ recovery     │
│              │ │ events      │ │            │ │              │
└──────────────┘ └──────────────┘ └────────────┘ └──────────────┘
       │              │              │              │
       └──────────────┼──────────────┼──────────────┘
                      ▼
         ┌─────────────────────────────┐
         │   Event Bus Service          │
         │  (Port 5005)                 │
         │ ┌───────────────────────────┤
         │ │ • Aggregate events        │
         │ │ • Log all events          │
         │ │ • Provide event stream    │
         │ │ • Route to subscribers    │
         │ └───────────────────────────┤
         └─────────────────────────────┘
```

## Core Services

### 1. **Gateway Service** (Port 5000)
- **Role**: API proxy and request router
- **Responsibilities**:
  - Route all incoming requests to appropriate services
  - Aggregate responses from multiple services
  - Implement error handling and response transformation
  - Provide unified API contract for frontend
- **Technology**: Express.js
- **Key Endpoints**:
  - GET/POST `/api/regions/*`
  - GET/POST `/api/simulations/*`
  - GET/POST `/api/resources/*`
  - GET/POST `/api/faults/*`
  - GET `/api/events/*`

### 2. **Region Service** (Port 5001)
- **Role**: Manage regions and their connectivity
- **Responsibilities**:
  - CRUD operations on regions
  - Maintain region connectivity graph (adjacency matrix)
  - Store demographic data (population, initial S/I/R states)
  - Seed demo data with realistic regions
- **Technology**: Express.js + in-memory store
- **Events Published**:
  - `region.created`
  - `region.updated`
  - `region.deleted`
- **Sample Data**: 5-10 regions with realistic names and connectivity

### 3. **Simulation Service** (Port 5002)
- **Role**: Execute epidemic progression algorithm
- **Responsibilities**:
  - Implement SIR (Susceptible-Infected-Recovered) model
  - Calculate daily disease spread based on infection rate
  - Query region connectivity for inter-region spread
  - Track day-by-day state changes
  - Emit infection events for resource service
  - Handle simulation lifecycle (start, pause, resume, stop)
- **Technology**: Express.js + epidemiological calculations
- **Events Published**:
  - `simulation.started`
  - `simulation.day.advanced`
  - `infection.detected`
  - `infection.updated`
  - `infection.spread` (cross-region)
  - `outbreak.declared`
  - `simulation.completed`

### 4. **Resource Service** (Port 5003)
- **Role**: Track and allocate medical resources
- **Responsibilities**:
  - Maintain inventory (beds, vaccines, oxygen)
  - Listen to infection events
  - Calculate resource demand based on outbreak severity
  - Implement demand-driven allocation algorithm
  - Track allocation history
  - Detect and report shortages
- **Technology**: Express.js + allocation engine
- **Events Consumed**:
  - `infection.updated` (to trigger demand calculation)
  - `simulation.day.advanced` (to update inventory)
- **Events Published**:
  - `resources.requested`
  - `resources.allocated`
  - `shortage.detected`

### 5. **Fault Service** (Port 5004)
- **Role**: Monitor service health and resilience
- **Responsibilities**:
  - Perform periodic health checks on all services
  - Simulate service failures (fault injection)
  - Track recovery and downtime metrics
  - Implement retry/circuit-breaker logic
  - Log fault events and recovery
- **Technology**: Express.js + health monitoring
- **Events Published**:
  - `service.failed`
  - `service.recovered`
  - `health.check`
  - `health.check.failed`

### 6. **Event Bus Service** (Port 5005)
- **Role**: Central event aggregation and logging
- **Responsibilities**:
  - Accept published events from all services
  - Maintain event history log
  - Provide event stream API for subscribers
  - Log all events with timestamps
  - Enable event filtering and querying
- **Technology**: Express.js + in-memory pub-sub
- **Endpoints**:
  - POST `/api/events` - publish event
  - GET `/api/events/stream` - get event history
  - GET `/api/events/:eventType` - get events by type
- **Storage**: In-memory bounded history (10,000 events max)

## Event-Driven Communication

All services communicate asynchronously through a central event bus:

```
Service A                Service B
   │                        │
   │ publishes event        │
   ├──────────────►Event Bus─┤
   │                     └──►│ consumes event
   │                        │
   └─ continues processing  │ takes action
```

### Event Flow Example: Infection Spread

1. **Simulation Service** processes day 5 and detects new infections
2. Publishes `infection.updated` event to Event Bus
3. **Resource Service** consumes event, calculates demand
4. Publishes `resources.requested` event
5. **Resource Service** allocates resources, publishes `resources.allocated`
6. **Event Bus** logs both events
7. **Frontend** polls `/api/events/stream`, updates dashboard

## Shared Infrastructure

### Shared Module (`/shared`)
Contains contracts and utilities used by all services:

- **events/**: Event type definitions and schemas
- **constants/**: Service ports, disease parameters, resource types
- **schemas/**: Data validation schemas
- **utils/**: Logger, HTTP client, date utilities

### Configuration
- `.env.example`: Master environment template
- Service ports centralized in `shared/constants/servicePorts.js`
- Event types centralized in `shared/events/eventTypes.js`

## Data Flow

### 1. Region Creation
```
Frontend → Gateway → Region Service → Event Bus
         ↓
    Region.created event published
         ↓
    Stored in Event Bus history
         ↓
    Frontend polls /api/events/stream
```

### 2. Simulation Progression
```
Frontend requests: POST /api/simulations/:id/start
         ↓
Simulation Service starts day loop
         ↓
For each day:
  - Calculate S→I transitions using infection_rate
  - Calculate I→R transitions using recovery_rate
  - Check spread to connected regions
  - Emit infection.updated events
  - Resource Service reacts to demand
         ↓
Events published to Event Bus
         ↓
Frontend updates dashboard with real-time data
```

### 3. Resource Allocation
```
infection.updated event
         ↓
Resource Service calculates demand
         ↓
Allocate using priority algorithm:
  severity_weight * infected_count + region_priority
         ↓
Publish resources.allocated event
         ↓
Update inventory
         ↓
Check for shortages
         ↓
Publish shortage.detected if necessary
```

## Fault Tolerance

### Health Monitoring
- Fault Service polls all services every 10 seconds
- Tracks response time, status codes, availability
- Maintains health history

### Failure Scenarios
1. **Service Unavailable**: Circuit breaker activated, retries with exponential backoff
2. **Cascading Failure**: Fault Service detects, publishes `service.failed` event
3. **Recovery**: Service comes back online, circuit closes, publishes `service.recovered`

### Resilience Patterns
- **Retry**: Up to 3 attempts with exponential backoff
- **Timeout**: 5 second HTTP timeout
- **Circuit Breaker**: Open after 5 failures, half-open after 60 seconds
- **Fallback**: Return cached data or default values

## Deployment Architecture

### Local Development
- Docker Compose orchestrates all 6 services
- Frontend hot-reload with Vite
- Services auto-restart on code changes with nodemon

### Kubernetes (Production)
- Each service as a separate Deployment
- ConfigMap for shared configuration
- Services for internal networking
- Ingress for external access

### Infrastructure as Code
- **Terraform**: Provisions Azure resources (RG, AKS, ACR)
- **Ansible**: Configures nodes, installs Docker/Node
- **GitHub Actions**: Automates build, test, deploy pipeline

## Technology Stack

| Component | Technology |
|---|---|
| **Services** | Node.js + Express.js |
| **Frontend** | React 18 + Vite |
| **Event Bus** | In-memory pub-sub |
| **HTTP Client** | Fetch API with Retry |
| **Logging** | JSON console logs |
| **Containerization** | Docker |
| **Orchestration** | Docker Compose, Kubernetes |
| **IaC** | Terraform |
| **CM** | Ansible |
| **CI/CD** | GitHub Actions |

## Performance Considerations

- **Local Latency**: < 10ms between services
- **Event Processing**: < 100ms per event
- **Health Checks**: 10 second interval
- **Event History**: Bounded to 10,000 events (circular buffer)
- **Simulation**: ~1 day per 100ms for SIR calculations

## Security Notes

- All services on internal network (not exposed externally)
- Gateway provides single entry point
- CORS enabled for frontend communication
- Request logging for audit trail
- No authentication in development (add for production)

---

See [EVENT_CONTRACTS.md](EVENT_CONTRACTS.md) for detailed event specifications.
See [SERVICE_BOUNDARIES.md](SERVICE_BOUNDARIES.md) for service responsibilities.
