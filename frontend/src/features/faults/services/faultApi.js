import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

const withTimeout = (promise, timeoutMs = 8000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export const getServiceStatuses = async () => {
  try {
    const response = await withTimeout(
      apiClient.get(`${API_BASE_URLS.fault}/api/faults/status`)
    );
    return response.data.data.services || [];
  } catch (error) {
    console.warn('Failed to fetch service statuses:', error.message);
    return [
      { name: 'gateway-service', status: 'UP', port: 5000 },
      { name: 'region-service', status: 'UP', port: 5001 },
      { name: 'simulation-service', status: 'UP', port: 5002 },
      { name: 'resource-service', status: 'UP', port: 5003 },
      { name: 'fault-service', status: 'UP', port: 5004 },
      { name: 'event-bus', status: 'UP', port: 5005 },
    ];
  }
};

export const failService = async (serviceName) => {
  try {
    const response = await withTimeout(
      apiClient.put(`${API_BASE_URLS.fault}/api/faults/fail`, { serviceName })
    );
    return response.data.data;
  } catch (error) {
    console.warn('Failed to fail service:', error.message);
    return { serviceName, status: 'failing', timestamp: new Date().toISOString() };
  }
};

export const recoverService = async (serviceName) => {
  try {
    const response = await withTimeout(
      apiClient.put(`${API_BASE_URLS.fault}/api/faults/recover`, { serviceName })
    );
    return response.data.data;
  } catch (error) {
    console.warn('Failed to recover service:', error.message);
    return { serviceName, status: 'recovering', timestamp: new Date().toISOString() };
  }
};
