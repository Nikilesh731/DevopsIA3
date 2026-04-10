const GATEWAY_API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const API_BASE_URLS = {
  region: GATEWAY_API_BASE,
  simulation: GATEWAY_API_BASE,
  resource: GATEWAY_API_BASE,
  fault: GATEWAY_API_BASE,
};
