const { getRegions, infectRegion, allocateResource, getServiceStatuses } = require('../utils/httpClient');

const simulateSpread = async (regionId, spreadFactor) => {
  let serviceStatuses;
  try {
    serviceStatuses = await getServiceStatuses();
  } catch (error) {
    serviceStatuses = [
      { name: "region-service", status: "UP" },
      { name: "simulation-service", status: "UP" },
      { name: "resource-service", status: "UP" }
    ];
  }

  const regionServiceStatus = serviceStatuses.find(s => s.name === "region-service")?.status || "UP";
  const resourceServiceStatus = serviceStatuses.find(s => s.name === "resource-service")?.status || "UP";

  if (regionServiceStatus === "DOWN") {
    const error = new Error("Region service is unavailable");
    error.status = 503;
    throw error;
  }

  const regions = await getRegions();
  const sourceRegion = regions.find(r => r.id === parseInt(regionId));
  
  if (!sourceRegion) {
    throw new Error('Region not found');
  }
  
  const spreadCountPerRegion = Math.floor(sourceRegion.infection_count * spreadFactor);
  const affectedRegions = [];
  
  for (const region of regions) {
    if (region.id === parseInt(regionId)) {
      continue;
    }
    
    if (spreadCountPerRegion > 0) {
      const updatedRegion = await infectRegion(region.id, spreadCountPerRegion);
      
      const affectedRegion = {
        id: region.id,
        name: region.name,
        added_infections: spreadCountPerRegion,
        new_risk_level: updatedRegion.risk_level
      };

      if (resourceServiceStatus === "DOWN") {
        affectedRegion.resourcesAllocated = null;
        affectedRegion.allocationSkipped = true;
        affectedRegion.allocationMessage = "Resource service unavailable";
      } else {
        const resourcesAllocated = {
          beds: spreadCountPerRegion,
          oxygen: Math.ceil(spreadCountPerRegion / 2),
          vaccines: spreadCountPerRegion * 2
        };
        
        let allocationError = false;
        
        try {
          await allocateResource(region.id, region.name, 'beds', resourcesAllocated.beds);
        } catch (error) {
          allocationError = true;
        }
        
        try {
          await allocateResource(region.id, region.name, 'oxygen', resourcesAllocated.oxygen);
        } catch (error) {
          allocationError = true;
        }
        
        try {
          await allocateResource(region.id, region.name, 'vaccines', resourcesAllocated.vaccines);
        } catch (error) {
          allocationError = true;
        }
        
        affectedRegion.resourcesAllocated = resourcesAllocated;
        
        if (allocationError) {
          affectedRegion.allocationError = true;
        }
      }
      
      affectedRegions.push(affectedRegion);
    }
  }
  
  return {
    success: true,
    sourceRegion: {
      id: sourceRegion.id,
      name: sourceRegion.name,
      infection_count: sourceRegion.infection_count,
      risk_level: sourceRegion.risk_level
    },
    spreadFactor,
    spreadCountPerRegion,
    affectedRegions
  };
};

module.exports = {
  simulateSpread
};
