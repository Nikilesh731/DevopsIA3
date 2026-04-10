# Distributed Epidemic Simulation and Resource Allocation System
# Using Event-Driven Architecture and Fault Tolerance

This is a production-grade distributed system for academic study in Distributed Computing and DevOps.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   cd services/event-bus && npm install && cd ../../
   cd services/gateway-service && npm install && cd ../../
   cd services/region-service && npm install && cd ../../
   cd services/simulation-service && npm install && cd ../../
   cd services/resource-service && npm install && cd ../../
   cd services/fault-service && npm install && cd ../../
   cd frontend && npm install && cd ../
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```

3. **Run all services locally (using docker-compose)**
   ```bash
   docker-compose up -d
   ```

   Or run individually:
   ```bash
   # Terminal 1: Event Bus
   cd services/event-bus && npm start

   # Terminal 2: Gateway
   cd services/gateway-service && npm start

   # Terminal 3: Region Service
   cd services/region-service && npm start

   # Terminal 4: Simulation Service
   cd services/simulation-service && npm start

   # Terminal 5: Resource Service
   cd services/resource-service && npm start

   # Terminal 6: Fault Service
   cd services/fault-service && npm start

   # Terminal 7: Frontend
   cd frontend && npm run dev
   ```

4. **Access the dashboard**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:5000
   - Event Stream: http://localhost:5005/api/events/stream

## 📊 System Architecture

### Services (Microservices)
- **Gateway Service** (port 5000): Unified API routing and request aggregation
- **Region Service** (port 5001): Region management and connectivity
- **Simulation Service** (port 5002): Epidemic progression engine
- **Resource Service** (port 5003): Medical resource management and allocation
- **Fault Service** (port 5004): Service health monitoring and fault injection
- **Event Bus** (port 5005): Central event aggregation and logging

### Shared Infrastructure
- **shared/**: Common events, constants, schemas, utilities
- **frontend/**: React + Vite monitoring dashboard
- **.github/workflows/**: CI/CD pipelines
- **infra/**: Docker, Kubernetes, Terraform, Ansible configurations

## 🔄 Event-Driven Architecture

All services communicate through a central event bus. Events include:
- Region lifecycle: `region.created`, `region.updated`, `region.deleted`
- Simulation: `simulation.started`, `simulation.day.advanced`, `simulation.completed`
- Infection: `infection.detected`, `infection.updated`, `infection.spread`, `outbreak.declared`
- Resources: `resources.requested`, `resources.allocated`, `shortage.detected`
- Health: `service.failed`, `service.recovered`, `health.check`

See [docs/architecture/EVENT_CONTRACTS.md](docs/architecture/EVENT_CONTRACTS.md) for complete event specifications.

## 📚 Documentation

- [Architecture Overview](docs/architecture/ARCHITECTURE.md)
- [Event Contracts](docs/architecture/EVENT_CONTRACTS.md)
- [Service Boundaries](docs/architecture/SERVICE_BOUNDARIES.md)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/architecture/DEPLOYMENT_GUIDE.md)
- [Getting Started for Developers](docs/getting-started/)

## 🚀 Deployment

### Docker Compose (Local)
```bash
docker-compose up -d
docker-compose logs -f
```

### Kubernetes (Production)
```bash
kubectl apply -f infra/kubernetes/namespace.yaml
kubectl apply -f infra/kubernetes/
```

### Terraform (Infrastructure as Code)
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## 🧪 Testing & CI/CD

The system includes automated CI/CD pipelines in `.github/workflows/`:
- `ci-build.yml`: Build, lint, test, and deploy
- `deploy-staging.yml`: Staging environment deployment
- `deploy-production.yml`: Production deployment

Run locally with GitHub Actions CLI:
```bash
act -l
act push
```

## 🏥 Epidemic Simulation

The system simulates disease spread using the SIR (Susceptible-Infected-Recovered) model across multiple interconnected regions. Key features:

- **Realistic parameters**: Infection rate, recovery rate, mortality rate
- **Spatial spread**: Disease spreads between connected regions based on mobility
- **Resource tracking**: Tracks hospital beds, vaccines, oxygen based on demand
- **Fault tolerance**: Simulates service failures and recovery mechanisms
- **Day-by-day progression**: Detailed step-through simulation results

### Sample Parameters
- Infection Rate: 15% per day
- Recovery Rate: 10% per day  
- Mortality Rate: 2%
- Total Simulation: 30-90 days
- Regions: 5-10 interconnected regions

## 🎛️ Dashboard Features

- **Overview Cards**: Total regions, active outbreaks, infected/recovered counts
- **Epidemic Trends**: Charts showing infection progression over time
- **Region Management**: Create, list, and manage regions with connectivity
- **Resource Tracking**: View availability, allocations, and shortages
- **Service Health**: Monitor health status of all backend services
- **Event Log**: Real-time event stream from all services
- **Alerts Panel**: Critical alerts and outbreak notifications

## 🛡️ Fault Tolerance

The system demonstrates resilience patterns:
- **Health Checks**: Periodic health monitoring of all services
- **Retry Logic**: Exponential backoff retry strategy
- **Circuit Breaker**: Prevent cascading failures
- **Event Logging**: All events logged for audit trail
- **Service Recovery**: Track recovery and downtime

## 📁 Project Structure

```
├── frontend/                   # React dashboard
├── services/
│   ├── event-bus/             # Central event aggregator
│   ├── gateway-service/       # API router
│   ├── region-service/        # Region management
│   ├── simulation-service/    # Epidemic engine
│   ├── resource-service/      # Resource allocation
│   └── fault-service/         # Health monitoring
├── shared/                    # Shared contracts & utilities
├── infra/                     # DevOps configurations
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── ansible/
├── .github/workflows/         # CI/CD pipelines
├── docs/                      # Documentation
└── docker-compose.yml         # Local orchestration
```

## 🎓 Educational Value

This system demonstrates:

**Distributed Computing**
- Microservice architecture
- Asynchronous event-driven communication
- Distributed state management
- Service discovery concepts
- Fault tolerance and resilience

**DevOps**
- Containerization (Docker)
- Orchestration (Docker Compose, Kubernetes)
- Infrastructure as Code (Terraform)
- Configuration Management (Ansible)
- CI/CD Pipelines (GitHub Actions)
- Monitoring and observability

## 📝 License

MIT

## 👥 Team

Academic project for Distributed Computing and DevOps courses.

---

**Last Updated**: April 10, 2026
