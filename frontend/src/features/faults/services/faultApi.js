import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

export const getServiceStatuses = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URLS.fault}/api/faults/status`);
    return response.data.data.services || [];
  } catch (error) {
    throw new Error(`Failed to fetch service statuses: ${error.message}`);
  }
};

export const failService = async (serviceName) => {
  try {
    const response = await apiClient.put(`${API_BASE_URLS.fault}/api/faults/fail`, {
      serviceName
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fail service: ${error.message}`);
  }
};

export const recoverService = async (serviceName) => {
  try {
    const response = await apiClient.put(`${API_BASE_URLS.fault}/api/faults/recover`, {
      serviceName
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to recover service: ${error.message}`);
  }
};
