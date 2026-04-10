import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

export const getResources = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URLS.resource}/api/resources`);
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch resources: ${error.message}`);
  }
};

export const getAllocations = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URLS.resource}/api/resources/allocations`);
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch allocations: ${error.message}`);
  }
};

export const allocateResource = async (allocationData) => {
  try {
    const response = await apiClient.post(`${API_BASE_URLS.resource}/api/resources/allocate`, allocationData);
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to allocate resource: ${error.message}`);
  }
};
