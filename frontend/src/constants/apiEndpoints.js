/**
 * Centralized API Endpoint Definitions
 * All backend API routes accessed through gateway
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Regions
  REGIONS: {
    LIST: `${API_BASE}/regions`,
    CREATE: `${API_BASE}/regions`,
    GET: (id) => `${API_BASE}/regions/${id}`,
    UPDATE: (id) => `${API_BASE}/regions/${id}`,
    DELETE: (id) => `${API_BASE}/regions/${id}`,
    CONNECTIVITY: `${API_BASE}/regions/connectivity`,
  },

  // Simulations
  SIMULATIONS: {
    LIST: `${API_BASE}/simulations`,
    CREATE: `${API_BASE}/simulations`,
    GET: (id) => `${API_BASE}/simulations/${id}`,
    START: (id) => `${API_BASE}/simulations/${id}/start`,
    PAUSE: (id) => `${API_BASE}/simulations/${id}/pause`,
    RESUME: (id) => `${API_BASE}/simulations/${id}/resume`,
    STOP: (id) => `${API_BASE}/simulations/${id}/stop`,
  },

  // Resources
  RESOURCES: {
    LIST: `${API_BASE}/resources`,
    GET: (id) => `${API_BASE}/resources/${id}`,
    ALLOCATE: (id) => `${API_BASE}/resources/${id}/allocate`,
    HISTORY: (id) => `${API_BASE}/resources/${id}/history`,
    SHORTAGES: `${API_BASE}/resources/shortages`,
  },

  // Faults
  FAULTS: {
    LIST: `${API_BASE}/faults`,
    CREATE: `${API_BASE}/faults`,
    GET: (id) => `${API_BASE}/faults/${id}`,
    INJECT: (id) => `${API_BASE}/faults/${id}/inject`,
    RECOVER: (id) => `${API_BASE}/faults/${id}/recover`,
    HEALTH: `${API_BASE}/faults/health`,
  },

  // Events
  EVENTS: {
    STREAM: `${API_BASE}/events/stream`,
    GET_BY_TYPE: (type) => `${API_BASE}/events/${type}`,
    ALL: `${API_BASE}/events`,
  },

  // Dashboard
  DASHBOARD: {
    SUMMARY: `${API_BASE}/dashboard/summary`,
    SNAPSHOT: `${API_BASE}/dashboard/snapshot`,
    TRENDS: `${API_BASE}/dashboard/trends`,
  },

  // Health
  HEALTH: `${API_BASE}/health`,
};

export const SERVICE_HEALTH_ENDPOINTS = {
  GATEWAY: 'http://localhost:5000/health',
  REGION: 'http://localhost:5001/health',
  SIMULATION: 'http://localhost:5002/health',
  RESOURCE: 'http://localhost:5003/health',
  FAULT: 'http://localhost:5004/health',
  EVENT_BUS: 'http://localhost:5005/health',
};

export default API_ENDPOINTS;
