/**
 * Region Model - Using In-Memory Storage
 * PostgreSQL integration can be added later with proper async/await setup
 */

// Seed data - Initialize with demo regions
let regions = [
  { id: 1, name: 'North City', population: 500000, susceptible: 500000, infected: 0, recovered: 0, deaths: 0, risk_level: 'LOW', priority_score: 0, infection_ratio: 0, population_at_risk: 500000, resource_demand: 'LOW' },
  { id: 2, name: 'Central Region', population: 750000, susceptible: 750000, infected: 5, recovered: 0, deaths: 0, risk_level: 'LOW', priority_score: 5.5, infection_ratio: 0.0067, population_at_risk: 755000, resource_demand: 'LOW' },
  { id: 3, name: 'South District', population: 600000, susceptible: 588000, infected: 12, recovered: 0, deaths: 0, risk_level: 'MEDIUM', priority_score: 18.2, infection_ratio: 0.02, population_at_risk: 600000, resource_demand: 'MEDIUM' },
  { id: 4, name: 'East Zone', population: 450000, susceptible: 442000, infected: 8, recovered: 0, deaths: 0, risk_level: 'LOW', priority_score: 12.1, infection_ratio: 0.0178, population_at_risk: 450000, resource_demand: 'LOW' },
  { id: 5, name: 'West Province', population: 800000, susceptible: 800000, infected: 0, recovered: 0, deaths: 0, risk_level: 'LOW', priority_score: 0, infection_ratio: 0, population_at_risk: 800000, resource_demand: 'LOW' },
];
let nextId = 6;

/**
 * Calculate priority score for a region
 */
const calculatePriorityScore = (region) => {
  const infectionRatio = region.infected / (region.population || 1);
  const populationAtRisk = region.infected + region.susceptible;
  
  let demandLevel = 'LOW';
  let demandScore = 25;
  
  if (infectionRatio > 0.1) {
    demandLevel = 'CRITICAL';
    demandScore = 100;
  } else if (infectionRatio > 0.05) {
    demandLevel = 'HIGH';
    demandScore = 75;
  } else if (infectionRatio > 0.01) {
    demandLevel = 'MEDIUM';
    demandScore = 50;
  }

  const infectionScore = Math.min(infectionRatio * 100, 100);
  const populationScore = Math.min((populationAtRisk / region.population) * 100, 100);
  const priorityScore = (infectionScore * 0.4) + (populationScore * 0.3) + (demandScore * 0.3);
  
  return {
    priorityScore: Math.round(priorityScore * 100) / 100,
    infectionRatio,
    populationAtRisk,
    resourceDemand: demandLevel
  };
};

/**
 * Get all regions with analytics
 */
const getAllRegions = async () => {
  return regions.map(r => ({ ...r, ...calculatePriorityScore(r) })).sort((a, b) => b.priority_score - a.priority_score);
};

/**
 * Get region by ID
 */
const getRegionById = async (id) => {
  const region = regions.find(r => r.id === parseInt(id));
  return region ? { ...region, ...calculatePriorityScore(region) } : null;
};

/**
 * Create a new region
 */
const createRegion = async (name, population = 500000, latitude, longitude) => {
  const region = {
    id: nextId++,
    name,
    population,
    susceptible: population,
    infected: 0,
    recovered: 0,
    deaths: 0,
    risk_level: 'LOW',
    latitude,
    longitude
  };
  regions.push(region);
  const scores = calculatePriorityScore(region);
  return { ...region, ...scores };
};

/**
 * Update infection count and recalculate priority
 */
const updateInfectionCount = async (id, infectedCount) => {
  const regionIndex = regions.findIndex(r => r.id === parseInt(id));
  if (regionIndex === -1) return null;
  
  let riskLevel = 'LOW';
  if (infectedCount > 150) {
    riskLevel = 'HIGH';
  } else if (infectedCount > 50) {
    riskLevel = 'MEDIUM';
  }

  regions[regionIndex].infected = infectedCount;
  regions[regionIndex].risk_level = riskLevel;
  const scores = calculatePriorityScore(regions[regionIndex]);
  
  return { ...regions[regionIndex], ...scores };
};

/**
 * Get regions sorted by priority
 */
const getRegionsByPriority = async () => {
  return regions.map(r => ({ ...r, ...calculatePriorityScore(r) }))
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 10);
};

/**
 * Get analytics for all regions
 */
const getRegionAnalytics = async () => {
  return regions.map(r => {
    const scores = calculatePriorityScore(r);
    return {
      id: r.id,
      name: r.name,
      population: r.population,
      infected: r.infected,
      susceptible: r.susceptible,
      recovered: r.recovered,
      deaths: r.deaths,
      priority_score: scores.priorityScore,
      infection_ratio: scores.infectionRatio,
      population_at_risk: scores.populationAtRisk,
      resource_demand_level: scores.resourceDemand,
      allocation_count: 0,
      total_resources_allocated: 0
    };
  }).sort((a, b) => b.priority_score - a.priority_score);
};

module.exports = {
  getAllRegions,
  getRegionById,
  createRegion,
  updateInfectionCount,
  calculatePriorityScore,
  getRegionsByPriority,
  getRegionAnalytics
};
