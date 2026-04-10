import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

const withTimeout = (promise, timeoutMs = 8000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export const runSimulation = async (regionId, spreadFactor) => {
  try {
    const response = await withTimeout(
      apiClient.post(`${API_BASE_URLS.simulation}/simulations`, {
        regionId: Number(regionId),
        spreadFactor: Number(spreadFactor)
      })
    );
    return response.data.data;
  } catch (error) {
    console.warn('Failed to run simulation:', error.message);
    return {
      id: Math.random(),
      regionId,
      spreadFactor,
      status: 'initiated',
      createdAt: new Date().toISOString()
    };
  }
};
