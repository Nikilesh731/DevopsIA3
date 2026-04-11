import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';

const withTimeout = (promise, timeoutMs = 8000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

export const createSimulation = async (simulationData) => {
  try {
    const response = await withTimeout(
      apiClient.post(`${API_BASE_URLS.simulation}/api/simulation/create`, simulationData)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to create simulation: ${error.message}`);
  }
};

export const runSimulation = async (simulationId) => {
  try {
    const response = await withTimeout(
      apiClient.post(`${API_BASE_URLS.simulation}/api/simulation/${simulationId}/run`)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to run simulation: ${error.message}`);
  }
};

export const getSimulations = async () => {
  try {
    const response = await withTimeout(
      apiClient.get(`${API_BASE_URLS.simulation}/api/simulations`)
    );
    return response.data.data || [];
  } catch (error) {
    throw new Error(`Failed to fetch simulations: ${error.message}`);
  }
};

export const getSimulationResults = async (simulationId) => {
  try {
    const response = await withTimeout(
      apiClient.get(`${API_BASE_URLS.simulation}/api/simulation/${simulationId}/results`)
    );
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch simulation results: ${error.message}`);
  }
};
