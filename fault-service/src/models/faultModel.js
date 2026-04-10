const services = [
  { name: "region-service", status: "UP" },
  { name: "simulation-service", status: "UP" },
  { name: "resource-service", status: "UP" }
];

const getAllServices = () => {
  return services;
};

const findService = (serviceName) => {
  return services.find(service => service.name === serviceName);
};

const updateServiceStatus = (serviceName, status) => {
  const service = findService(serviceName);
  if (service) {
    service.status = status;
    return service;
  }
  return null;
};

module.exports = {
  getAllServices,
  findService,
  updateServiceStatus
};
