const resourceService = require('../services/resourceService');

const getInventory = (req, res) => {
  try {
    const inventory = resourceService.getInventory();
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllocations = (req, res) => {
  try {
    const allocations = resourceService.getAllocations();
    res.json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const allocateResource = (req, res) => {
  try {
    const { regionId, regionName, type, quantity } = req.body;
    const result = resourceService.allocateResource(regionId, regionName, type, quantity);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Resource type not found') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

module.exports = {
  getInventory,
  getAllocations,
  allocateResource
};
