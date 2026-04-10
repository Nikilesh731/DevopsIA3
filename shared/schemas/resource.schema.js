/**
 * Resource Data Schema and Validation
 */

export const RESOURCE_SCHEMA = {
  type: 'object',
  required: ['regionId', 'beds', 'vaccines', 'oxygen'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    regionId: { type: 'string', format: 'uuid' },
    beds: { type: 'integer', minimum: 0 },
    vaccines: { type: 'integer', minimum: 0 },
    oxygen: { type: 'integer', minimum: 0 },
    medicalTeams: { type: 'integer', minimum: 0, default: 0 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

/**
 * Validate resource data
 * @param {object} resource - Resource data
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateResource(resource) {
  const errors = [];

  if (!resource || typeof resource !== 'object') {
    return { valid: false, errors: ['Resource must be an object'] };
  }

  if (!resource.regionId || typeof resource.regionId !== 'string') {
    errors.push('Region ID is required');
  }

  if (typeof resource.beds !== 'number' || resource.beds < 0) {
    errors.push('Beds must be a non-negative number');
  }

  if (typeof resource.vaccines !== 'number' || resource.vaccines < 0) {
    errors.push('Vaccines must be a non-negative number');
  }

  if (typeof resource.oxygen !== 'number' || resource.oxygen < 0) {
    errors.push('Oxygen must be a non-negative number');
  }

  const medicalTeams = resource.medicalTeams || 0;
  if (typeof medicalTeams !== 'number' || medicalTeams < 0) {
    errors.push('Medical teams must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default RESOURCE_SCHEMA;
