# Event Contracts & Specifications

Complete catalog of all events in the system with payload structures and validation rules.

## Event Registry

### Region Lifecycle Events

#### event: `region.created`
**Published by**: Region Service  
**Consumed by**: Simulation Service, Resource Service, Dashboard

**Schema**:
```json
{
  "eventType": "region.created",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "name": "North Region",
    "population": 1000000,
    "susceptible": 999500,
    "infected": 500,
    "recovered": 0,
    "deaths": 0,
    "connectedRegionIds": ["other-uuid-1", "other-uuid-2"],
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

#### event: `region.updated`
**Published by**: Region Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "region.updated",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "name": "North Region (Updated)",
    "connectedRegionIds": ["other-uuid-1"]
  }
}
```

#### event: `region.deleted`
**Published by**: Region Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "region.deleted",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {}
}
```

---

### Simulation Lifecycle Events

#### event: `simulation.started`
**Published by**: Simulation Service  
**Consumed by**: Resource Service, Fault Service, Dashboard

**Schema**:
```json
{
  "eventType": "simulation.started",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "simulationId": "sim-123-abc",
  "data": {
    "sourceRegionId": "550e8400-e29b-41d4-a716-446655440000",
    "infectionRate": 0.15,
    "recoveryRate": 0.10,
    "mortalityRate": 0.02,
    "totalDays": 90,
    "mobilityFactor": 1.0
  }
}
```

#### event: `simulation.day.advanced`
**Published by**: Simulation Service  
**Consumed by**: Resource Service, Dashboard

**Schema**:
```json
{
  "eventType": "simulation.day.advanced",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "simulationId": "sim-123-abc",
  "data": {
    "day": 5,
    "totalInfected": 5000,
    "totalRecovered": 1000,
    "totalDeaths": 100,
    "regionsAffected": 3,
    "newCasesCount": 2000
  }
}
```

#### event: `simulation.completed`
**Published by**: Simulation Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "simulation.completed",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "simulationId": "sim-123-abc",
  "data": {
    "finalDay": 90,
    "totalInfected": 150000,
    "totalRecovered": 800000,
    "totalDeaths": 5000,
    "finalSeverity": "high",
    "durationSeconds": 45
  }
}
```

---

### Infection Events

#### event: `infection.detected`
**Published by**: Simulation Service  
**Consumed by**: Resource Service, Fault Service, Dashboard

**Schema**:
```json
{
  "eventType": "infection.detected",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "simulationId": "sim-123-abc",
  "data": {
    "infectedCount": 500,
    "severity": "low",
    "day": 1
  }
}
```

#### event: `infection.updated`
**Published by**: Simulation Service  
**Consumed by**: Resource Service, Dashboard

**Schema**:
```json
{
  "eventType": "infection.updated",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "simulationId": "sim-123-abc",
  "data": {
    "susceptible": 980000,
    "infected": 5000,
    "recovered": 10000,
    "deaths": 200,
    "severity": "high",
    "day": 5,
    "changeInInfected": 2000
  }
}
```

#### event: `infection.spread`
**Published by**: Simulation Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "infection.spread",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "simulationId": "sim-123-abc",
  "data": {
    "fromRegionId": "region-1",
    "toRegionId": "region-2",
    "newInfectedCount": 100,
    "day": 3
  }
}
```

#### event: `outbreak.declared`
**Published by**: Simulation Service  
**Consumed by**: Resource Service, Fault Service, Dashboard

**Schema**:
```json
{
  "eventType": "outbreak.declared",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "simulationId": "sim-123-abc",
  "data": {
    "severity": "critical",
    "infectedCount": 50000,
    "day": 10
  }
}
```

---

### Resource Events

#### event: `resources.requested`
**Published by**: Resource Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "resources.requested",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "simulationId": "sim-123-abc",
  "data": {
    "beds": {
      "required": 5000,
      "available": 3000,
      "shortage": 2000
    },
    "vaccines": {
      "required": 50000,
      "available": 30000,
      "shortage": 20000
    },
    "oxygen": {
      "required": 1000,
      "available": 800,
      "shortage": 200
    },
    "priority": 85
  }
}
```

#### event: `resources.allocated`
**Published by**: Resource Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "resources.allocated",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "simulationId": "sim-123-abc",
  "data": {
    "beds": 2000,
    "vaccines": 20000,
    "oxygen": 200,
    "allocationStrategy": "severity-based",
    "allocatedAt": "2026-04-10T12:00:00.000Z"
  }
}
```

#### event: `shortage.detected`
**Published by**: Resource Service  
**Consumed by**: Dashboard, Alert System

**Schema**:
```json
{
  "eventType": "shortage.detected",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "550e8400-e29b-41d4-a716-446655440000",
  "simulationId": "sim-123-abc",
  "data": {
    "resourceType": "beds",
    "shortageAmount": 2000,
    "severity": "critical",
    "remainingCapacity": 10,
    "percentageUtilized": 99.9
  }
}
```

---

### Service Health Events

#### event: `service.failed`
**Published by**: Fault Service  
**Consumed by**: Dashboard, Alert System, Event Log

**Schema**:
```json
{
  "eventType": "service.failed",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "serviceName": "simulation-service",
  "data": {
    "reason": "Connection refused on port 5002",
    "affectedEndpoints": [
      "POST /api/simulations",
      "GET /api/simulations/:id"
    ],
    "severity": "critical",
    "retryAttempts": 0,
    "nextRetryAt": "2026-04-10T12:00:01.000Z"
  }
}
```

#### event: `service.recovered`
**Published by**: Fault Service  
**Consumed by**: Dashboard, Event Log

**Schema**:
```json
{
  "eventType": "service.recovered",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "serviceName": "simulation-service",
  "data": {
    "recoveredAt": "2026-04-10T12:00:30.000Z",
    "durationMs": 30000,
    "affectedEndpoints": [
      "POST /api/simulations",
      "GET /api/simulations/:id"
    ]
  }
}
```

#### event: `health.check`
**Published by**: Fault Service  
**Consumed by**: Event Log

**Schema**:
```json
{
  "eventType": "health.check",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "serviceName": "region-service",
  "data": {
    "status": "healthy",
    "responseTimeMs": 5,
    "lastSuccessfulCheck": "2026-04-10T12:00:00.000Z"
  }
}
```

---

### System Events

#### event: `system.alert`
**Published by**: Any Service  
**Consumed by**: Dashboard, Alert System, Event Log

**Schema**:
```json
{
  "eventType": "system.alert",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "data": {
    "alertType": "resource_critical",
    "severity": "critical",
    "message": "Critical shortage of hospital beds in North Region",
    "affectedServices": ["resource-service", "dashboard"]
  }
}
```

---

## Event Processing Rules

### Ordering Guarantee
- Events have strict ordering within a region/simulation
- Cannot guarantee global order across independent simulations
- Event timestamp indicates logical order

### Idempotency
- Processing the same event twice should be safe
- Consumers should track processed event IDs
- Deduplicate by combination of eventType + sourceId + timestamp

### Retention
- Event history retained for 10,000 recent events
- Older events can be archived to permanent storage
- Event stream accessible via `/api/events/stream` endpoint

### Error Handling
- Failed event processing should not block other events
- Poison pill events logged but not re-processed
- Error notifications via `system.alert` events

---

## Event Flow Diagram

```
┌──────────────────────┐
│  Region Service      │
│  Creates region      │
└──────────┬───────────┘
           │
      region.created
           │
           ├───────────────────────────────┐
           │                               │
    ┌──────▼───────────┐          ┌────────▼─────────┐
    │  Event Bus       │          │ Simulation Svc   │
    │  (logs event)    │          │ (prepares sim)   │
    └────────┬─────────┘          └──────────────────┘
             │
        ┌────┴──────────────┐
        │                   │
        │           ┌───────▼──────────┐
        │           │ Simulation Svc   │
        │           │ Starts sim       │
        │           └────────┬─────────┘
        │                    │
        │              simulation.started
        │                    │
    ┌───┴────────────────────┼────────────────┐
    │                        │                │
    │                  ┌─────▼────────────┐   │
    │                  │ Resource Svc     │   │
    │                  │ (prepares rsrc)  │   │
    │                  └──────────────────┘   │
    │                                         │
    │ ┌──────────────────────────────────────┼───────┐
    │ │                                      │       │
    │ │ For each simulation day:             │       │
    │ │  - Calculate spread                  │       │
    │ │  - Publish infection.updated         │       │
    │ │  - Publish infection.spread          │       │
    │ │  - Publish resources.requested       │       │
    │ │  - Publish resources.allocated       │       │
    │ │  - Publish shortage.detected         │       │
    │ │                                      │       │
    │ └──────────────────────────────────────┴───────┤
    │                                                 │
    │                                      ┌──────────▼───────┐
    │                                      │ Dashboard        │
    │                                      │ (polls events)   │
    │                                      │ (displays data)  │
    │                                      └──────────────────┘
    │
    └────────────► Event Log Storage
                   (searchable by type, service, time)
```

---

## API Endpoints for Events

### Publish Event
```http
POST /api/events
Content-Type: application/json

{
  "eventType": "region.created",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "uuid",
  "data": { ... }
}

Response:
{
  "success": true,
  "eventType": "region.created",
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

### Get Event Stream
```http
GET /api/events/stream?eventType=infection.updated&limit=50

Response:
{
  "success": true,
  "eventCount": 50,
  "events": [
    { "eventType": "...", "timestamp": "...", "data": {...} },
    ...
  ]
}
```

### Get Events by Type
```http
GET /api/events/{eventType}?limit=100

Response:
{
  "success": true,
  "eventType": "infection.updated",
  "eventCount": 100,
  "events": [...]
}
```

---

**Last Updated**: April 10, 2026
