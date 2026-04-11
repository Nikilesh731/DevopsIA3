const normalizeGatewayBase = (value) => {
  if (!value) return '';
  return value.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const GATEWAY_API_BASE = normalizeGatewayBase(import.meta.env.VITE_API_BASE);

export const API_BASE_URLS = {
  region: GATEWAY_API_BASE,
  simulation: GATEWAY_API_BASE,
  resource: GATEWAY_API_BASE,
  fault: GATEWAY_API_BASE,
};
