const resourceModel = require('../models/resourceModel');

const getInventory = async () => {
  return await resourceModel.getInventory();
};

const getAllocations = async () => {
  return await resourceModel.getAllocations();
};

const allocateResource = async (regionId, regionName, type, quantity) => {
  if (!regionId || !type || !quantity) {
    throw new Error('All fields are required');
  }
  
  return await resourceModel.allocateResource(regionId, regionName, type, quantity);
};

module.exports = {
  getInventory,
  getAllocations,
  allocateResource
};
