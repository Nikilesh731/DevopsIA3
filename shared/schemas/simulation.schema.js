/**
 * Simulation Data Schema and Validation
 */

export const SIMULATION_SCHEMA = {
  type: 'object',
  required: ['sourceRegionId', 'infectionRate', 'recoveryRate', 'totalDays'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    sourceRegionId: { type: 'string', format: 'uuid' },
    infectionRate: { type: 'number', minimum: 0, maximum: 1 },
    recoveryRate: { type: 'number', minimum: 0, maximum: 1 },
    mortalityRate: { type: 'number', minimum: 0, maximum: 1, default: 0.02 },
    totalDays: { type: 'integer', minimum: 1, maximum: 365 },
    mobilityFactor: { type: 'number', minimum: 0, maximum: 2, default: 1 },
    currentDay: { type: 'integer', minimum: 0, default: 0 },
    status: {
      type: 'string',
      enum: ['pending', 'running', 'paused', 'completed', 'failed'],
      default: 'pending',
    },
    createdAt: { type: 'string', format: 'date-time' },
    startedAt: { type: 'string', format: 'date-time' },
    completedAt: { type: 'string', format: 'date-time' },
  },
};

/**
 * Validate simulation parameters
 * @param {object} sim - Simulation data
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateSimulation(sim) {
  const errors = [];

  if (!sim || typeof sim !== 'object') {
    return { valid: false, errors: ['Simulation must be an object'] };
  }

  if (!sim.sourceRegionId || typeof sim.sourceRegionId !== 'string') {
    errors.push('Source region ID is required');
  }

  if (typeof sim.infectionRate !== 'number' || sim.infectionRate < 0 || sim.infectionRate > 1) {
    errors.push('Infection rate must be between 0 and 1');
  }

  if (typeof sim.recoveryRate !== 'number' || sim.recoveryRate < 0 || sim.recoveryRate > 1) {
    errors.push('Recovery rate must be between 0 and 1');
  }

  const mortalityRate = sim.mortalityRate || 0;
  if (typeof mortalityRate !== 'number' || mortalityRate < 0 || mortalityRate > 1) {
    errors.push('Mortality rate must be between 0 and 1');
  }

  if (!Number.isInteger(sim.totalDays) || sim.totalDays < 1 || sim.totalDays > 365) {
    errors.push('Total days must be an integer between 1 and 365');
  }

  const mobilityFactor = sim.mobilityFactor || 1;
  if (typeof mobilityFactor !== 'number' || mobilityFactor < 0 || mobilityFactor > 2) {
    errors.push('Mobility factor must be between 0 and 2');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default SIMULATION_SCHEMA;
