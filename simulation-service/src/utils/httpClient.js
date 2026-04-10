const axios = require('axios');

const SERVICE_URLS = {
  region: process.env.REGION_SERVICE_URL || 'http://localhost:5001',
  resource: process.env.RESOURCE_SERVICE_URL || 'http://localhost:5003',
  fault: process.env.FAULT_SERVICE_URL || 'http://localhost:5004',
};

const getRegions = async () => {
  try {
    const response = await axios.get(`${SERVICE_URLS.region}/api/regions`);
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to fetch regions: ${error.message}`);
  }
};

const infectRegion = async (id, count) => {
  try {
    const response = await axios.put(`${SERVICE_URLS.region}/api/regions/${id}/infect`, {
      count: count
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to infect region ${id}: ${error.message}`);
  }
};

const allocateResource = async (regionId, regionName, type, quantity) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.resource}/api/resources/allocate`, {
      regionId: regionId,
      regionName: regionName,
      type: type,
      quantity: quantity
    });
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to allocate resource for region ${regionId}: ${error.message}`);
  }
};

const getServiceStatuses = async () => {
  try {
    const response = await axios.get(`${SERVICE_URLS.fault}/api/faults/status`);
    return response.data.data.services;
  } catch (error) {
    throw new Error(`Failed to fetch service statuses: ${error.message}`);
  }
};

module.exports = {
  getRegions,
  infectRegion,
  allocateResource,
  getServiceStatuses
};
