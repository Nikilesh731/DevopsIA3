import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

const withTimeout = (promise, timeoutMs = 8000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export const getRegions = async () => {
  try {
    const response = await withTimeout(
      apiClient.get(`${API_BASE_URLS.region}/api/regions`)
    );
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch regions: ${error.message}`);
  }
};

export const createRegion = async (regionData) => {
  try {
    const response = await withTimeout(
      apiClient.post(`${API_BASE_URLS.region}/api/regions`, regionData)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to create region: ${error.message}`);
  }
};

export const infectRegion = async (id, count) => {
  try {
    const response = await withTimeout(
      apiClient.put(`${API_BASE_URLS.region}/api/regions/${id}/infect`, { count })
    );
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to infect region: ${error.message}`);
  }
};
