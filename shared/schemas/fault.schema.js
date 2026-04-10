/**
 * Fault Data Schema and Validation
 */

export const FAULT_SCHEMA = {
  type: 'object',
  required: ['serviceName', 'faultType'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    serviceName: { type: 'string' },
    faultType: {
      type: 'string',
      enum: ['unavailable', 'slow', 'error', 'cascading'],
    },
    severity: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
    },
    reason: { type: 'string' },
    affectedEndpoints: { type: 'array', items: { type: 'string' } },
    injectedAt: { type: 'string', format: 'date-time' },
    recoveredAt: { type: 'string', format: 'date-time' },
    durationMs: { type: 'integer', minimum: 0 },
    retryAttempts: { type: 'integer', minimum: 0, default: 0 },
    status: {
      type: 'string',
      enum: ['active', 'resolved', 'cascading'],
      default: 'active',
    },
  },
};

/**
 * Validate fault data
 * @param {object} fault - Fault data
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateFault(fault) {
  const errors = [];

  if (!fault || typeof fault !== 'object') {
    return { valid: false, errors: ['Fault must be an object'] };
  }

  if (!fault.serviceName || typeof fault.serviceName !== 'string') {
    errors.push('Service name is required');
  }

  if (
    !fault.faultType ||
    !['unavailable', 'slow', 'error', 'cascading'].includes(fault.faultType)
  ) {
    errors.push('Fault type must be one of: unavailable, slow, error, cascading');
  }

  if (fault.severity && !['low', 'medium', 'high', 'critical'].includes(fault.severity)) {
    errors.push('Severity must be one of: low, medium, high, critical');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default FAULT_SCHEMA;
