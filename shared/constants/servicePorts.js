/**
 * Central Service Port Configuration
 * All services must use these port definitions to ensure no conflicts
 */

export const SERVICE_PORTS = {
  GATEWAY: process.env.GATEWAY_PORT || 5000,
  REGION: process.env.REGION_PORT || 5001,
  SIMULATION: process.env.SIMULATION_PORT || 5002,
  RESOURCE: process.env.RESOURCE_PORT || 5003,
  FAULT: process.env.FAULT_PORT || 5004,
  EVENT_BUS: process.env.EVENT_BUS_PORT || 5005,
  FRONTEND: process.env.FRONTEND_PORT || 3000,
};

export const SERVICE_URLS = {
  GATEWAY: `http://localhost:${SERVICE_PORTS.GATEWAY}`,
  REGION: `http://localhost:${SERVICE_PORTS.REGION}`,
  SIMULATION: `http://localhost:${SERVICE_PORTS.SIMULATION}`,
  RESOURCE: `http://localhost:${SERVICE_PORTS.RESOURCE}`,
  FAULT: `http://localhost:${SERVICE_PORTS.FAULT}`,
  EVENT_BUS: `http://localhost:${SERVICE_PORTS.EVENT_BUS}`,
};

export const SERVICE_NAMES = {
  GATEWAY: 'gateway-service',
  REGION: 'region-service',
  SIMULATION: 'simulation-service',
  RESOURCE: 'resource-service',
  FAULT: 'fault-service',
  EVENT_BUS: 'event-bus',
};

export const API_ENDPOINTS = {
  GATEWAY: {
    BASE: `${SERVICE_URLS.GATEWAY}/api`,
    REGIONS: `${SERVICE_URLS.GATEWAY}/api/regions`,
    SIMULATIONS: `${SERVICE_URLS.GATEWAY}/api/simulations`,
    RESOURCES: `${SERVICE_URLS.GATEWAY}/api/resources`,
    FAULTS: `${SERVICE_URLS.GATEWAY}/api/faults`,
    EVENTS: `${SERVICE_URLS.GATEWAY}/api/events`,
    HEALTH: `${SERVICE_URLS.GATEWAY}/health`,
  },
  REGION: {
    BASE: `${SERVICE_URLS.REGION}/api`,
    REGIONS: `${SERVICE_URLS.REGION}/api/regions`,
    HEALTH: `${SERVICE_URLS.REGION}/health`,
  },
  SIMULATION: {
    BASE: `${SERVICE_URLS.SIMULATION}/api`,
    SIMULATIONS: `${SERVICE_URLS.SIMULATION}/api/simulations`,
    HEALTH: `${SERVICE_URLS.SIMULATION}/health`,
  },
  RESOURCE: {
    BASE: `${SERVICE_URLS.RESOURCE}/api`,
    RESOURCES: `${SERVICE_URLS.RESOURCE}/api/resources`,
    HEALTH: `${SERVICE_URLS.RESOURCE}/health`,
  },
  FAULT: {
    BASE: `${SERVICE_URLS.FAULT}/api`,
    FAULTS: `${SERVICE_URLS.FAULT}/api/faults`,
    HEALTH: `${SERVICE_URLS.FAULT}/health`,
  },
  EVENT_BUS: {
    BASE: `${SERVICE_URLS.EVENT_BUS}/api`,
    EVENTS: `${SERVICE_URLS.EVENT_BUS}/api/events`,
    STREAM: `${SERVICE_URLS.EVENT_BUS}/api/events/stream`,
    HEALTH: `${SERVICE_URLS.EVENT_BUS}/health`,
  },
};

export default SERVICE_PORTS;
