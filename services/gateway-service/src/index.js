const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const SERVICES = {
  region: process.env.REGION_SERVICE_URL || 'http://localhost:5001',
  simulation: process.env.SIMULATION_SERVICE_URL || 'http://localhost:5002',
  resource: process.env.RESOURCE_SERVICE_URL || 'http://localhost:5003',
  fault: process.env.FAULT_SERVICE_URL || 'http://localhost:5004',
  eventBus: process.env.EVENT_BUS_SERVICE_URL || 'http://localhost:5005',
};

app.use(cors());
app.use(express.json());

const buildUrl = (baseUrl, path, search = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}${search}`;
};

const forwardJson = async (req, res, baseUrl, path) => {
  const search = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
  const targetUrl = buildUrl(baseUrl, path, search);
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body || {}),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const errorBody = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
    return res.status(response.status).json(typeof errorBody === 'string' ? { success: false, message: errorBody } : errorBody);
  }

  if (response.status === 204) {
    return res.status(204).end();
  }

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return res.status(response.status).json(data);
  }

  const text = await response.text();
  return res.status(response.status).send(text);
};

const serviceHealth = async (name, url) => {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${url.replace(/\/$/, '')}/health`, { signal: controller.signal });
    clearTimeout(timeoutHandle);

    return {
      name,
      url,
      status: response.ok ? 'UP' : 'DOWN',
      code: response.status,
    };
  } catch (error) {
    return {
      name,
      url,
      status: 'DOWN',
      error: error.message,
    };
  }
};

app.get('/health', async (req, res) => {
  const services = await Promise.all([
    {
      name: 'gateway-service',
      url: `http://localhost:${PORT}`,
      status: 'UP',
      code: 200,
    },
    serviceHealth('region-service', SERVICES.region),
    serviceHealth('simulation-service', SERVICES.simulation),
    serviceHealth('resource-service', SERVICES.resource),
    serviceHealth('fault-service', SERVICES.fault),
    serviceHealth('event-bus', SERVICES.eventBus),
  ]);

  res.json({
    status: 'healthy',
    service: 'gateway-service',
    timestamp: new Date().toISOString(),
    services,
  });
});

app.get('/api/health', async (req, res) => {
  const services = await Promise.all([
    {
      name: 'gateway-service',
      url: `http://localhost:${PORT}`,
      status: 'UP',
      code: 200,
    },
    serviceHealth('region-service', SERVICES.region),
    serviceHealth('simulation-service', SERVICES.simulation),
    serviceHealth('resource-service', SERVICES.resource),
    serviceHealth('fault-service', SERVICES.fault),
    serviceHealth('event-bus', SERVICES.eventBus),
  ]);

  res.json({
    status: 'healthy',
    service: 'gateway-service',
    timestamp: new Date().toISOString(),
    services,
  });
});

app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    data: SERVICES,
  });
});

app.get('/api/regions', (req, res) => forwardJson(req, res, SERVICES.region, '/api/regions'));
app.post('/api/regions', (req, res) => forwardJson(req, res, SERVICES.region, '/api/regions'));
app.put('/api/regions/:id/infect', (req, res) => forwardJson(req, res, SERVICES.region, `/api/regions/${req.params.id}/infect`));
app.get('/api/regions/analytics', (req, res) => forwardJson(req, res, SERVICES.region, '/api/regions/analytics'));
app.get('/api/regions/analytics/priority', (req, res) => forwardJson(req, res, SERVICES.region, '/api/regions/analytics/priority'));

app.get('/api/resources', (req, res) => forwardJson(req, res, SERVICES.resource, '/api/resources/inventory'));
app.get('/api/resources/inventory', (req, res) => forwardJson(req, res, SERVICES.resource, '/api/resources/inventory'));
app.get('/api/resources/allocations', (req, res) => forwardJson(req, res, SERVICES.resource, '/api/resources/allocations'));
app.post('/api/resources/allocate', (req, res) => forwardJson(req, res, SERVICES.resource, '/api/resources/allocate'));

app.get('/api/faults/status', (req, res) => forwardJson(req, res, SERVICES.fault, '/api/faults/status'));
app.put('/api/faults/fail', (req, res) => forwardJson(req, res, SERVICES.fault, '/api/faults/fail'));
app.put('/api/faults/recover', (req, res) => forwardJson(req, res, SERVICES.fault, '/api/faults/recover'));

app.post('/api/simulations', (req, res) => forwardJson(req, res, SERVICES.simulation, '/simulate'));

app.get('/api/events', (req, res) => forwardJson(req, res, SERVICES.eventBus, '/api/events'));
app.post('/api/events', (req, res) => forwardJson(req, res, SERVICES.eventBus, '/api/events'));
app.get('/api/events/stream', (req, res) => forwardJson(req, res, SERVICES.eventBus, '/api/events/stream'));
app.get('/api/events/:eventType', (req, res) => forwardJson(req, res, SERVICES.eventBus, `/api/events/${req.params.eventType}`));

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const [regionsResponse, allocationsResponse, faultsResponse] = await Promise.all([
      fetch(`${SERVICES.region.replace(/\/$/, '')}/api/regions`),
      fetch(`${SERVICES.resource.replace(/\/$/, '')}/api/resources/allocations`),
      fetch(`${SERVICES.fault.replace(/\/$/, '')}/api/faults/status`),
    ]);

    const regionsPayload = await regionsResponse.json();
    const allocationsPayload = await allocationsResponse.json();
    const faultsPayload = await faultsResponse.json();

    const regions = regionsPayload.data || [];
    const allocations = allocationsPayload.data || [];
    const services = faultsPayload.data?.services || [];

    const totalInfections = regions.reduce((sum, region) => sum + (region.infected || region.infection_count || 0), 0);

    res.json({
      success: true,
      data: {
        totalRegions: regions.length,
        totalInfections,
        totalAllocations: allocations.length,
        servicesUp: services.filter((service) => service.status === 'UP').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    service: 'gateway-service',
    version: '1.0.0',
    status: 'running',
  });
});

app.listen(PORT, () => {
  console.log(`Gateway service running on port ${PORT}`);
});