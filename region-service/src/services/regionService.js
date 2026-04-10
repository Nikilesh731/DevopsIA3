const regionModel = require('../models/regionModel');
const { publishInfectionEvent } = require('../events/publisher');

const createRegion = async (name, population = 500000, latitude, longitude) => {
  if (!name) {
    throw new Error('Region name is required');
  }
  return await regionModel.createRegion(name, population, latitude, longitude);
};

const getAllRegions = async () => {
  return await regionModel.getAllRegions();
};

const updateInfection = async (id, count) => {
  const region = await regionModel.getRegionById(id);
  if (!region) {
    throw new Error('Region not found');
  }

  if (typeof count !== 'number' || count < 0) {
    throw new Error('Valid infection count is required');
  }

  const updatedRegion = await regionModel.updateInfectionCount(id, count);
  if (!updatedRegion) {
    throw new Error('Region not found');
  }
  
  publishInfectionEvent(updatedRegion);
  return updatedRegion;
};

const getAnalytics = async () => {
  return await regionModel.getRegionAnalytics();
};

const getRegionsByPriority = async () => {
  return await regionModel.getRegionsByPriority();
};

module.exports = {
  createRegion,
  getAllRegions,
  updateInfection,
  getAnalytics,
  getRegionsByPriority
};
