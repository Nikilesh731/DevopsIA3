import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

export const runSimulation = async (regionId, spreadFactor) => {
  try {
    const response = await apiClient.post(`${API_BASE_URLS.simulation}/simulations`, {
      regionId: Number(regionId),
      spreadFactor: Number(spreadFactor)
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to run simulation: ${error.message}`);
  }
};
