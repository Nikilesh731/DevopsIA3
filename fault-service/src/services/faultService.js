const faultModel = require('../models/faultModel');

const getServiceStatuses = () => {
  const services = faultModel.getAllServices();
  return { services };
};

const failService = (serviceName) => {
  const service = faultModel.findService(serviceName);
  if (!service) {
    throw new Error('Service not found');
  }
  
  const updatedService = faultModel.updateServiceStatus(serviceName, 'DOWN');
  return updatedService;
};

const recoverService = (serviceName) => {
  const service = faultModel.findService(serviceName);
  if (!service) {
    throw new Error('Service not found');
  }
  
  const updatedService = faultModel.updateServiceStatus(serviceName, 'UP');
  return updatedService;
};

module.exports = {
  getServiceStatuses,
  failService,
  recoverService
};
