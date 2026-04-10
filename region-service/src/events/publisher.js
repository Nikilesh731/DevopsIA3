const publishInfectionEvent = (region) => {
  console.log('Event Published - Infection Update:', {
    regionId: region.id,
    regionName: region.name,
    newInfectionCount: region.infection_count,
    riskLevel: region.risk_level,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  publishInfectionEvent
};
