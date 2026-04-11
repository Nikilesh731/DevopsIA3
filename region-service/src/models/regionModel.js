const { query } = require('../../../shared/db/database.cjs');

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

const mapRegionRow = (row, allocationStats = {}) => {
  const scores = calculatePriorityScore(row);

  return {
    id: row.id,
    name: row.name,
    population: row.population,
    susceptible: row.susceptible,
    infected: row.infected,
    recovered: row.recovered,
    deaths: row.deaths,
    risk_level: row.risk_level,
    latitude: row.latitude,
    longitude: row.longitude,
    region_type: row.region_type,
    connected_regions: row.connected_regions,
    last_update_day: row.last_update_day,
    created_at: row.created_at,
    updated_at: row.updated_at,
    priority_score: scores.priorityScore,
    infection_ratio: scores.infectionRatio,
    population_at_risk: scores.populationAtRisk,
    resource_demand_level: scores.resourceDemand,
    allocation_count: Number(allocationStats.allocation_count || 0),
    total_resources_allocated: Number(allocationStats.total_resources_allocated || 0),
  };
};

const getAllocationStats = async () => {
  const result = await query(
    `SELECT region_id, COUNT(*) AS allocation_count, COALESCE(SUM(quantity), 0) AS total_resources_allocated
     FROM allocations
     GROUP BY region_id`
  );

  return result.rows.reduce((accumulator, row) => {
    accumulator[row.region_id] = row;
    return accumulator;
  }, {});
};

/**
 * Get all regions with analytics
 */
const getAllRegions = async () => {
  const [regionsResult, allocationStats] = await Promise.all([
    query('SELECT * FROM regions ORDER BY id ASC'),
    getAllocationStats(),
  ]);

  return regionsResult.rows
    .map((row) => mapRegionRow(row, allocationStats[row.id] || {}))
    .sort((a, b) => b.priority_score - a.priority_score);
};

/**
 * Get region by ID
 */
const getRegionById = async (id) => {
  const result = await query('SELECT * FROM regions WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return null;
  }

  const allocationStats = await getAllocationStats();
  return mapRegionRow(result.rows[0], allocationStats[id] || {});
};

/**
 * Create a new region
 */
const createRegion = async (name, population = 500000, latitude, longitude) => {
  const result = await query(
    `INSERT INTO regions
     (name, population, susceptible, infected, recovered, deaths, risk_level, latitude, longitude, region_type, connected_regions, last_update_day)
     VALUES ($1, $2, $3, 0, 0, 0, 'LOW', $4, $5, $6, $7, 0)
     RETURNING *`,
    [
      name,
      population,
      population,
      latitude ?? 0,
      longitude ?? 0,
      'State',
      null,
    ]
  );

  return mapRegionRow(result.rows[0]);
};

/**
 * Update infection count and recalculate priority
 */
const updateInfectionCount = async (id, infectedCount) => {
  const existingRegion = await getRegionById(id);
  if (!existingRegion) {
    return null;
  }

  let riskLevel = 'LOW';
  if (infectedCount > 150) {
    riskLevel = 'HIGH';
  } else if (infectedCount > 50) {
    riskLevel = 'MEDIUM';
  }

  const susceptible = Math.max((existingRegion.population || 0) - infectedCount - (existingRegion.recovered || 0) - (existingRegion.deaths || 0), 0);

  const result = await query(
    `UPDATE regions
     SET infected = $1,
         susceptible = $2,
         risk_level = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [infectedCount, susceptible, riskLevel, id]
  );

  const allocationStats = await getAllocationStats();
  return mapRegionRow(result.rows[0], allocationStats[id] || {});
};

/**
 * Get regions sorted by priority
 */
const getRegionsByPriority = async () => {
  const regions = await getAllRegions();
  return regions.slice(0, 10);
};

/**
 * Get analytics for all regions
 */
const getRegionAnalytics = async () => {
  return getAllRegions();
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
