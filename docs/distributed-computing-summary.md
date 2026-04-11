# Distributed Epidemic Simulation — Distributed Computing Summary

**Scope:** Focused on distributed systems concepts, architecture, data flow, algorithms, fault tolerance, and testing. Excludes DevOps, deployment, and infrastructure operations.

## Project Purpose
A distributed microservice-based epidemic simulation that models regions, infections, resource allocation, and fault scenarios. Services communicate via HTTP and an event-bus; persistent state is held in PostgreSQL.

## High-level Architecture
- Microservices:
  - `gateway-service` — API gateway and aggregator.
  - `region-service` — region metadata, population, and analytics.
  - `simulation-service` — simulation engine that advances days, computes spread, and stores daily snapshots.
  - `resource-service` — inventory and allocation logic.
  - `fault-service` — inject and recover faults to test resilience.
  - `event-bus` — simple pub/sub service for events between services.
- Frontend: React SPA that queries the gateway for data and displays DB-backed results.
- Database: PostgreSQL for durable storage of `simulations`, `simulation_daily_data`, and `infection_history`.

## Core Distributed Concepts Demonstrated
- Service decomposition: clear separation of concerns for simulation, regions, resources.
- Event-driven interactions: services emit/consume events to decouple side-effects (e.g., simulation -> resource adjustments).
- Consistency: write simulation results to the DB as the canonical source of truth; other services read from DB or consume events.
- Resilience and fault injection: `fault-service` simulates service failures to validate graceful degradation.
- Observability: health endpoints and aggregated dashboard data to observe system state.

## Key Algorithms & Data Flows
- Epidemic model (in `simulation-service`): per-day snapshot loop that computes new infections using infection-rate parameters and connected-region spreading. Final daily snapshot is persisted as the authoritative day record.
- Region connectivity: `connected_regions` is parsed and normalized (robust parsing to handle JSON arrays, CSV, or single values).
- Resource allocation: heuristic allocation logic in `resource-service` that assigns inventory based on region priority and analytics.

## Data Model (conceptual)
- `simulations` (id, params_json, status, started_at, completed_at)
- `simulation_daily_data` (id, simulation_id, day_index, snapshot_json)
- `resources` / `allocations` (resource_id, region_id, quantity, timestamp)

## APIs (gateway-level, canonical names)
- `GET /api/regions` — list regions and analytics
- `POST /api/simulation/create` — create simulation entry
- `POST /api/simulation/:id/run` — run simulation (triggers engine)
- `GET /api/simulation/:id/results` — retrieve daily snapshots for a simulation
- `GET /api/simulations` — list simulations and statuses

## Fault Tolerance & Robustness
- Defensive parsing and validation prevent crashes (e.g., safe `connected_regions` parsing).
- Simulation status updates use `started_at`/`completed_at` timestamps and status enum to avoid partial states.
- Timeouts on inter-service calls to avoid blocking aggregations (gateway uses short fetch timeouts for health checks).

## Testing & Validation
- Unit testing: service modules can be unit-tested (model step functions, parsers, DB helpers).
- Integration testing: API flows via the gateway to verify end-to-end behavior between services.
- End-to-end: headless Playwright script (`scripts/run_simulation_headless.cjs`) automates creating/running a simulation and validating results returned from the gateway.

## How to Run Locally (developer-focused, not infrastructure)
- Start the services locally (node) during development, or run the provided orchestrated environment for convenience.
- Quick (developer): start services individually using `npm run start` inside each service folder (see `package.json` in each service).
- For replication of experiments, see the `scripts/run_simulation_headless.cjs` test harness (captures network traces and validates completion).

## Limitations & Notes
- This summary intentionally omits deployment and operational specifics (container orchestration, infra-as-code, CI/CD). Those are documented separately in the DevOps summary.
- Single-node PostgreSQL used for convenience; distributed DB considerations (replication, sharding) are out of scope here.

## Useful Code Pointers
- Simulation engine: `services/simulation-service/src/services/simulationService.js`
- Gateway routes: `services/gateway-service/src/index.js`
- Headless validation: `scripts/run_simulation_headless.cjs`

## Suggested Next Steps (research / distributed topics)
- Add formal contract tests between services (consumer-driven contract testing).
- Replace single-node DB with a replicated cluster and evaluate consistency models.
- Add end-to-end fault injection scenarios with coordinated chaos experiments that observe system behavior under partitions.

---
*Generated for ChatGPT usage: concise summary of distributed-computing aspects. Excludes DevOps and infra specifics.*
