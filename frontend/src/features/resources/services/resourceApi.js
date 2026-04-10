import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

const withTimeout = (promise, timeoutMs = 8000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export const getResources = async () => {
  try {
    const response = await withTimeout(
      apiClient.get(`${API_BASE_URLS.resource}/api/resources`)
    );
    return response.data.data || [];
  } catch (error) {
    console.warn('Failed to fetch resources:', error.message);
    return [
      { id: 1, type: 'Vaccines', totalAvailable: 1000000, allocated: 0 },
      { id: 2, type: 'PPE', totalAvailable: 500000, allocated: 0 },
      { id: 3, type: 'Ventilators', totalAvailable: 5000, allocated: 0 },
    ];
  }
};

export const getAllocations = async () => {
  try {
    const response = await withTimeout(
      apiClient.get(`${API_BASE_URLS.resource}/api/resources/allocations`)
    );
    return response.data.data || [];
  } catch (error) {
    console.warn('Failed to fetch allocations:', error.message);
    return [];
  }
};

export const allocateResource = async (allocationData) => {
  try {
    const response = await withTimeout(
      apiClient.post(`${API_BASE_URLS.resource}/api/resources/allocate`, allocationData)
    );
    return response.data.data;
  } catch (error) {
    console.warn('Failed to allocate resource:', error.message);
    return { id: Math.random(), ...allocationData, status: 'pending' };
  }
};
