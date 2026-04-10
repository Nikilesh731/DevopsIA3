#!/bin/sh
set -e

echo "=========================================="
echo "Starting service initialization..."
echo "=========================================="

# Determine service directory - handle both root-level and nested services
if [ -d "/app/services/gateway-service" ]; then
  SERVICE_DIR="/app/services/gateway-service"
  SERVICE_NAME="gateway-service"
elif [ -d "/app/services/event-bus" ]; then
  SERVICE_DIR="/app/services/event-bus"
  SERVICE_NAME="event-bus"
elif [ -d "/app/simulation-service" ]; then
  SERVICE_DIR="/app/simulation-service"
  SERVICE_NAME="simulation-service"
elif [ -d "/app/region-service" ]; then
  SERVICE_DIR="/app/region-service"
  SERVICE_NAME="region-service"
elif [ -d "/app/resource-service" ]; then
  SERVICE_DIR="/app/resource-service"
  SERVICE_NAME="resource-service"
elif [ -d "/app/fault-service" ]; then
  SERVICE_DIR="/app/fault-service"
  SERVICE_NAME="fault-service"
else
  SERVICE_DIR=$(pwd)
  SERVICE_NAME=$(basename "$SERVICE_DIR")
fi

echo "Service: $SERVICE_NAME"
echo "Service directory: $SERVICE_DIR"

# Wait for PostgreSQL to be ready (with retries)
MAX_ATTEMPTS=30
ATTEMPT=1

check_db() {
  echo "Checking database connectivity (attempt $ATTEMPT/$MAX_ATTEMPTS)..."
  
  if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set, skipping database check"
    return 0
  fi
  
  return 0
}

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  check_db && break
  ATTEMPT=$((ATTEMPT + 1))
  sleep 1
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
  echo "Database not available after $MAX_ATTEMPTS attempts"
  echo "Proceeding anyway - database may initialize on first request"
fi

echo ""
echo "=========================================="
echo "Running database initialization..."
echo "=========================================="

# Run database initialization if init.js exists
if [ -f "/app/shared/db/init.js" ]; then
  echo "Found database initialization script"
  cd /app
  node shared/db/init.js || echo "Database initialization completed or already initialized"
  echo "Database initialization finished"
else
  echo "Database initialization script not found at /app/shared/db/init.js"
fi

echo ""
echo "=========================================="
echo "Starting application..."
echo "=========================================="
echo "Working directory before cd: $(pwd)"

# Change to service directory
cd "$SERVICE_DIR"
echo "Working directory after cd: $(pwd)"
echo "Executing: $@"

# Execute the main application command (this replaces the shell)
exec "$@"
