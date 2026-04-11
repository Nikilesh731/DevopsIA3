import express from 'express';
import httpProxy from 'http-proxy';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Create proxies for each service
const createProxy = (target) => {
  const proxy = httpProxy.createProxyServer({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Remove /api prefix before forwarding to backend services
      return path.replace(/^\/api/, '');
    },
    proxyTimeout: 30000,
    timeout: 30000,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${target}:`, err.message);
      res.status(503).json({
        error: 'Service unavailable',
        message: err.message
      });
    }
  });

  proxy.on('proxyRes', (proxyRes, req, res) => {
    proxyRes.headers['X-Powered-By'] = 'Epidemic-Gateway';
  });

  return proxy;
};

// Service URLs - using docker service names for internal routing
const SIMULATION_SERVICE = process.env.SIMULATION_SERVICE_URL || 'http://simulation-service:5001';
const REGION_SERVICE = process.env.REGION_SERVICE_URL || 'http://region-service:5003';
const RESOURCE_SERVICE = process.env.RESOURCE_SERVICE_URL || 'http://resource-service:5004';
const FAULT_SERVICE = process.env.FAULT_SERVICE_URL || 'http://fault-service:5005';
const EVENT_BUS_SERVICE = process.env.EVENT_BUS_SERVICE_URL || 'http://event-bus:5006';

const simulationProxy = createProxy(SIMULATION_SERVICE);
const regionProxy = createProxy(REGION_SERVICE);
const resourceProxy = createProxy(RESOURCE_SERVICE);
const faultProxy = createProxy(FAULT_SERVICE);
const eventBusProxy = createProxy(EVENT_BUS_SERVICE);

console.log('Gateway Configuration:');
console.log(`  Simulation Service: ${SIMULATION_SERVICE}`);
console.log(`  Region Service: ${REGION_SERVICE}`);
console.log(`  Resource Service: ${RESOURCE_SERVICE}`);
console.log(`  Fault Service: ${FAULT_SERVICE}`);
console.log(`  Event Bus Service: ${EVENT_BUS_SERVICE}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Gateway is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// SIMULATION SERVICE ROUTES (Port 5001)
// ============================================================

// Dashboard stats - route to simulation service
app.get('/api/dashboard/stats', (req, res) => {
  console.log('[GATEWAY] Routing GET /api/dashboard/stats to simulation-service');
  simulationProxy.web(req, res);
});

// Simulations endpoints
app.get('/api/simulations', (req, res) => {
  console.log('[GATEWAY] Routing GET /api/simulations to simulation-service');
  simulationProxy.web(req, res);
});

app.post('/api/simulations', (req, res) => {
  console.log('[GATEWAY] Routing POST /api/simulations to simulation-service');
  simulationProxy.web(req, res);
});

app.get('/api/simulations/:id', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/simulations/${req.params.id} to simulation-service`);
  simulationProxy.web(req, res);
});

// Simulation daily data
app.get('/api/simulations/:id/daily-data', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/simulations/${req.params.id}/daily-data to simulation-service`);
  simulationProxy.web(req, res);
});

// ============================================================
// REGION SERVICE ROUTES (Port 5003)
// ============================================================

app.get('/api/regions', (req, res) => {
  console.log('[GATEWAY] Routing GET /api/regions to region-service');
  regionProxy.web(req, res);
});

app.get('/api/regions/:id', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/regions/${req.params.id} to region-service`);
  regionProxy.web(req, res);
});

app.post('/api/regions', (req, res) => {
  console.log('[GATEWAY] Routing POST /api/regions to region-service');
  regionProxy.web(req, res);
});

app.put('/api/regions/:id', (req, res) => {
  console.log(`[GATEWAY] Routing PUT /api/regions/${req.params.id} to region-service`);
  regionProxy.web(req, res);
});

// ============================================================
// RESOURCE SERVICE ROUTES (Port 5004)
// ============================================================

app.get('/api/resources', (req, res) => {
  console.log('[GATEWAY] Routing GET /api/resources to resource-service');
  resourceProxy.web(req, res);
});

app.get('/api/resources/:id', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/resources/${req.params.id} to resource-service`);
  resourceProxy.web(req, res);
});

app.get('/api/resources/region/:regionId', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/resources/region/${req.params.regionId} to resource-service`);
  resourceProxy.web(req, res);
});

app.post('/api/resources', (req, res) => {
  console.log('[GATEWAY] Routing POST /api/resources to resource-service');
  resourceProxy.web(req, res);
});

app.post('/api/resources/allocate', (req, res) => {
  console.log('[GATEWAY] Routing POST /api/resources/allocate to resource-service');
  resourceProxy.web(req, res);
});

// ============================================================
// FAULT SERVICE ROUTES (Port 5005)
// ============================================================

app.get('/api/faults', (req, res) => {
  console.log('[GATEWAY] Routing GET /api/faults to fault-service');
  faultProxy.web(req, res);
});

app.get('/api/faults/:id', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/faults/${req.params.id} to fault-service`);
  faultProxy.web(req, res);
});

app.get('/api/faults/status/:status', (req, res) => {
  console.log(`[GATEWAY] Routing GET /api/faults/status/${req.params.status} to fault-service`);
  faultProxy.web(req, res);
});

app.post('/api/faults', (req, res) => {
  console.log('[GATEWAY] Routing POST /api/faults to fault-service');
  faultProxy.web(req, res);
});

app.put('/api/faults/:id/resolve', (req, res) => {
  console.log(`[GATEWAY] Routing PUT /api/faults/${req.params.id}/resolve to fault-service`);
  faultProxy.web(req, res);
});

// ============================================================
// EVENT BUS ROUTES (Port 5006)
// ============================================================

app.get('/api/events', (req, res) => {
  console.log('[GATEWAY] Routing GET /api/events to event-bus');
  eventBusProxy.web(req, res);
});

app.post('/api/events', (req, res) => {
  console.log('[GATEWAY] Routing POST /api/events to event-bus');
  eventBusProxy.web(req, res);
});

// ============================================================
// FALLBACK - Health checks for all services
// ============================================================

app.get('/api/health/simulation', (req, res) => {
  console.log('[GATEWAY] Checking simulation-service health');
  simulationProxy.web(req, res);
});

app.get('/api/health/region', (req, res) => {
  console.log('[GATEWAY] Checking region-service health');
  regionProxy.web(req, res);
});

app.get('/api/health/resource', (req, res) => {
  console.log('[GATEWAY] Checking resource-service health');
  resourceProxy.web(req, res);
});

app.get('/api/health/fault', (req, res) => {
  console.log('[GATEWAY] Checking fault-service health');
  faultProxy.web(req, res);
});

app.get('/api/health/events', (req, res) => {
  console.log('[GATEWAY] Checking event-bus health');
  eventBusProxy.web(req, res);
});

// 404 handler
app.use((req, res) => {
  console.log(`[GATEWAY] 404: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: {
      dashboard: 'GET /api/dashboard/stats',
      simulations: ['GET /api/simulations', 'POST /api/simulations'],
      regions: ['GET /api/regions', 'POST /api/regions'],
      resources: ['GET /api/resources', 'POST /api/resources/allocate'],
      faults: ['GET /api/faults', 'POST /api/faults', 'PUT /api/faults/:id/resolve'],
      health: 'GET /health'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err);
  res.status(500).json({
    error: 'Gateway error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Gateway Service listening on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`   Regions: http://localhost:${PORT}/api/regions`);
  console.log(`   Simulations: http://localhost:${PORT}/api/simulations`);
  console.log(`   Resources: http://localhost:${PORT}/api/resources`);
  console.log(`   Faults: http://localhost:${PORT}/api/faults`);
});
