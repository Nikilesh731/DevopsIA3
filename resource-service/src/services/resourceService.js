const resourceModel = require('../models/resourceModel');

const getInventory = () => {
  return resourceModel.getInventory();
};

const getAllocations = () => {
  return resourceModel.getAllocations();
};

const allocateResource = (regionId, regionName, type, quantity) => {
  if (!regionId || !regionName || !type || !quantity) {
    throw new Error('All fields are required');
  }
  
  return resourceModel.allocateResource(regionId, regionName, type, quantity);
};

module.exports = {
  getInventory,
  getAllocations,
  allocateResource
};
