# Distributed Epidemic Simulation — DevOps Summary

**Scope:** Focused exclusively on deployment, orchestration, CI/CD, infrastructure-as-code, monitoring, backups, and operational procedures. Excludes algorithmic or distributed-systems design details.

## Goals
- Describe how to build, run, update, and monitor the project in a reproducible, automated way.
- Document operational commands, common troubleshooting steps, and infrastructure artifacts present in the repository.

## Repository Infra Artifacts (where to look)
- Docker Compose: `docker-compose.yml` (service compositions for local/dev runs)
- Kubernetes manifests: `infra/kubernetes/*.yaml` (configmap, deployments, services, namespace)
- Terraform: `infra/terraform/*.tf` (cloud infra definitions and outputs)
- Ansible playbooks: `infra/ansible/site.yml` and `infra/ansible/inventory.example`
- DB init and events: `init-database.sql`, `events-init.sql`, `shared/db/init.js`

## Local Development & Rebuild Workflow
- Build and run full stack (development):
```powershell
docker compose up -d --build
```
- Rebuild only services you changed (faster):
```powershell
docker compose up -d --build simulation-service gateway-service
```
- Restart running services without rebuilding:
```powershell
docker compose restart simulation-service gateway-service
```
- Stop and remove containers and volumes (WARNING: will remove DB data):
```powershell
docker compose down --volumes
```

## Image & Artifact Management
- Images are built from service-level `Dockerfile`s (see each service folder).
- Tagging and pushing workflow (example):
```bash
# build and tag
docker build -t myregistry/epidemic-simulation:simulation-v1 ./services/simulation-service
# push
docker push myregistry/epidemic-simulation:simulation-v1
```
- Use a private registry or GitHub Container Registry for CI/CD artifacts.

## Kubernetes & Production Considerations
- Kubernetes manifests live in `infra/kubernetes` (deployments, services, configmap, namespace).
- Suggestions for production:
  - Use Deployment with PodDisruptionBudgets and liveness/readiness probes.
  - Configure HorizontalPodAutoscaler for stateless services (gateway, simulation workers if split).
  - Use StatefulSet or managed DB service for PostgreSQL (avoid local PVC for production without backups).
  - Secrets: store DB creds and API keys in a secret manager (e.g., Kubernetes Secrets backed by sealed-secrets or cloud KMS).

## Terraform & Provisioning
- `infra/terraform` contains example providers and resources. Use variables and remote state for team usage.
- Common workflow:
```bash
terraform init
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
```

## Configuration & Environment
- Centralized env files used by `docker-compose` and CI. Ensure `.env` has DB connection strings and service URLs.
- Example environment variables to check:
  - `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - `REGION_SERVICE_URL`, `SIMULATION_SERVICE_URL`, etc.

## CI/CD Recommendations
- Pipeline stages:
  1. Checkout
  2. Install dependencies & run unit tests
  3. Build and lint images
  4. Build and push container images to registry
  5. Apply infra (terraform) in staging
  6. Deploy manifests (helm/kubectl) and run integration tests
- Use ephemeral environments for PRs (preview environments) when possible.

## Monitoring, Logging, & Alerting
- Centralize logs via a log aggregator (ELK / Loki + Grafana). Forward container stdout to aggregator.
- Metrics: expose `/metrics` endpoints (Prometheus) or instrument Node.js app with counters/histograms.
- Alerts: set alerts for high error rates, high latency, DB replication lag, and pod restarts.

## Backups & Disaster Recovery
- Postgres backups: take regular base backups + WAL shipping or use managed DB snapshots.
- Test restore procedures periodically into a staging env.
- Store backups in immutable/object storage with retention policy.

## Common Troubleshooting Commands
- View compose logs for a service:
```powershell
docker compose logs --follow gateway-service
```
- Check container status:
```powershell
docker compose ps
```
- Exec into a running container:
```powershell
docker compose exec simulation-service sh
```
- Inspect Kubernetes resources:
```bash
kubectl get pods -n my-namespace
kubectl describe pod <pod-name> -n my-namespace
kubectl logs <pod-name> -n my-namespace
```

## Upgrades & Migrations
- DB migrations: run schema migrations before deploying code that depends on them. Use migration tools (e.g., `knex`, `sequelize-cli`, or `psql` scripts) and version them.
- Rolling updates: use readiness probes to avoid traffic to unready pods.

## Security & Secrets
- Do not commit secrets to VCS. Use vault, cloud secret manager, or Kubernetes Secrets.
- Use TLS for service-to-service and external traffic.
- Limit network policies to restrict communication between namespaces/services.

## Runbook (example: simulation-service 500 on run)
1. Check gateway logs: `docker compose logs gateway-service`.
2. Check simulation-service logs for stack trace: `docker compose logs simulation-service`.
3. If a DB schema error appears (e.g., missing column), inspect the SQL migration and run the migration locally.
4. If parsing or runtime errors appear, re-run the failing request via `curl` to reproduce, then fix code and rebuild the image + restart service.

## Artifacts in this repo
- `docker-compose.yml` — composition for local runs
- `infra/kubernetes` — manifests
- `infra/terraform` — provisioning examples
- `infra/ansible` — inventory and playbooks

---
*Generated for ChatGPT usage: operational, DevOps-focused summary. Excludes distributed-systems algorithmic details.*
