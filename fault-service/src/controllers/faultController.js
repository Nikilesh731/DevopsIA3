const faultService = require('../services/faultService');

const getStatus = (req, res) => {
  try {
    const data = faultService.getServiceStatuses();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const failService = (req, res) => {
  try {
    const { serviceName } = req.body;
    
    if (!serviceName) {
      return res.status(400).json({ success: false, message: 'serviceName is required' });
    }
    
    const data = faultService.failService(serviceName);
    res.json({ success: true, data });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const recoverService = (req, res) => {
  try {
    const { serviceName } = req.body;
    
    if (!serviceName) {
      return res.status(400).json({ success: false, message: 'serviceName is required' });
    }
    
    const data = faultService.recoverService(serviceName);
    res.json({ success: true, data });
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStatus,
  failService,
  recoverService
};
