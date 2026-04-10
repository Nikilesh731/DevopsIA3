# Shared Events Module

Central event type and schema definitions for the distributed epidemic simulation system.

## Event Types

All system-wide events are defined in `eventTypes.js`:

- **Region lifecycle**: `region.created`, `region.updated`, `region.deleted`
- **Simulation lifecycle**: `simulation.started`, `simulation.day.advanced`, `simulation.completed`
- **Infection progression**: `infection.detected`, `infection.updated`, `infection.spread`, `outbreak.declared`
- **Resource management**: `resources.requested`, `resources.allocated`, `shortage.detected`, `shortage.resolved`
- **Service health**: `service.failed`, `service.recovered`, `health.check`

## Event Schemas

Each event type has a defined payload schema in `eventSchemas.js` for validation.

## Usage

```javascript
import { EVENTS, createEvent, validateEvent } from '../shared/events/eventSchemas.js';

// Publish an event
const event = createEvent(EVENTS.REGION_CREATED, regionId, {
  name: 'New Region',
  population: 100000,
  susceptible: 99500,
  infected: 500,
  recovered: 0,
  connectedRegionIds: []
});

// Validate an event
try {
  validateEvent(event);
} catch (error) {
  console.error('Invalid event:', error.message);
}
```

## Service Integration

Each service publishes events through the event-bus service on port 5005.

POST /api/events

```json
{
  "eventType": "region.created",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "regionId": "uuid-here",
  "data": { ... }
}
```
