/**
 * Region Data Schema and Validation
 */

export const REGION_SCHEMA = {
  type: 'object',
  required: ['name', 'population', 'susceptible', 'infected', 'recovered'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    population: { type: 'integer', minimum: 0 },
    susceptible: { type: 'integer', minimum: 0 },
    infected: { type: 'integer', minimum: 0 },
    recovered: { type: 'integer', minimum: 0 },
    deaths: { type: 'integer', minimum: 0, default: 0 },
    connectedRegionIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      default: [],
    },
    latitude: { type: 'number', minimum: -90, maximum: 90 },
    longitude: { type: 'number', minimum: -180, maximum: 180 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

/**
 * Validate region data
 * @param {object} region - Region data to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateRegion(region) {
  const errors = [];

  if (!region || typeof region !== 'object') {
    return { valid: false, errors: ['Region must be an object'] };
  }

  if (!region.name || typeof region.name !== 'string' || region.name.trim() === '') {
    errors.push('Region name is required and must be a non-empty string');
  }

  if (typeof region.population !== 'number' || region.population < 0) {
    errors.push('Population must be a non-negative number');
  }

  if (typeof region.susceptible !== 'number' || region.susceptible < 0) {
    errors.push('Susceptible must be a non-negative number');
  }

  if (typeof region.infected !== 'number' || region.infected < 0) {
    errors.push('Infected must be a non-negative number');
  }

  if (typeof region.recovered !== 'number' || region.recovered < 0) {
    errors.push('Recovered must be a non-negative number');
  }

  // Validate that population >= susceptible + infected + recovered + deaths
  const deaths = region.deaths || 0;
  const total = region.susceptible + region.infected + region.recovered + deaths;
  if (total > region.population) {
    errors.push(
      `Sum of susceptible + infected + recovered + deaths (${total}) cannot exceed population (${region.population})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default REGION_SCHEMA;
