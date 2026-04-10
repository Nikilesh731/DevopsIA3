import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

export const getDashboardStats = async () => {
  try {
    const [regionsResponse, allocationsResponse, faultsResponse] = await Promise.all([
      apiClient.get(`${API_BASE_URLS.region}/api/regions`),
      apiClient.get(`${API_BASE_URLS.resource}/api/resources/allocations`),
      apiClient.get(`${API_BASE_URLS.fault}/api/faults/status`)
    ]);

    const regions = regionsResponse.data.data || [];
    const allocations = allocationsResponse.data.data || [];
    const services = faultsResponse.data.data?.services || [];

    const totalInfections = regions.reduce((sum, region) => sum + (region.infection_count || 0), 0);
    const servicesUp = services.filter(service => service.status === "UP").length;

    return {
      totalRegions: regions.length,
      totalInfections,
      totalAllocations: allocations.length,
      servicesUp
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
  }
};
