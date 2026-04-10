const regionService = require('../services/regionService');

const createRegion = async (req, res) => {
  try {
    const { name, population, latitude, longitude } = req.body;
    const region = await regionService.createRegion(name, population, latitude, longitude);
    res.status(201).json({ success: true, data: region });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllRegions = async (req, res) => {
  try {
    const regions = await regionService.getAllRegions();
    res.status(200).json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateInfection = async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;
    const region = await regionService.updateInfection(id, count);
    res.status(200).json({ success: true, data: region });
  } catch (error) {
    if (error.message === 'Region not found') {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = await regionService.getAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRegionsByPriority = async (req, res) => {
  try {
    const regions = await regionService.getRegionsByPriority();
    res.status(200).json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createRegion,
  getAllRegions,
  updateInfection,
  getAnalytics,
  getRegionsByPriority
};
