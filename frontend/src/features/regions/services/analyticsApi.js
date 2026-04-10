import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

export const getRegionAnalytics = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URLS.region}/api/regions/analytics`);
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch region analytics: ${error.message}`);
  }
};

export const getRegionsByPriority = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URLS.region}/api/regions/analytics/priority`);
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch priority regions: ${error.message}`);
  }
};
