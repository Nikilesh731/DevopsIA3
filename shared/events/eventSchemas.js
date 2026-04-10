/**
 * Event Schema Definitions and Validators
 * Ensures all events conform to expected data structures
 */

import { EVENTS, SEVERITY_LEVELS } from './eventTypes.js';

/**
 * Validates an event against its expected schema
 * @param {object} event - The event to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
export function validateEvent(event) {
  if (!event || typeof event !== 'object') {
    throw new Error('Event must be an object');
  }

  if (!event.eventType || !Object.values(EVENTS).includes(event.eventType)) {
    throw new Error(`Invalid eventType: ${event.eventType}`);
  }

  if (!event.timestamp || isNaN(new Date(event.timestamp).getTime())) {
    throw new Error('Invalid or missing timestamp');
  }

  if (!event.data || typeof event.data !== 'object') {
    throw new Error('Event must have data object');
  }

  return true;
}

/**
 * Schema definitions for each event type
 * Each event should conform to one of these patterns
 */
export const EVENT_SCHEMAS = {
  [EVENTS.REGION_CREATED]: {
    eventType: EVENTS.REGION_CREATED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    data: {
      name: 'string',
      population: 'number',
      susceptible: 'number',
      infected: 'number',
      recovered: 'number',
      deaths: 'number',
      connectedRegionIds: 'UUID[]',
    },
  },

  [EVENTS.REGION_UPDATED]: {
    eventType: EVENTS.REGION_UPDATED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    data: {
      name: 'string (optional)',
      connectedRegionIds: 'UUID[] (optional)',
    },
  },

  [EVENTS.REGION_DELETED]: {
    eventType: EVENTS.REGION_DELETED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    data: {},
  },

  [EVENTS.SIMULATION_STARTED]: {
    eventType: EVENTS.SIMULATION_STARTED,
    timestamp: 'ISO8601',
    simulationId: 'UUID',
    data: {
      sourceRegionId: 'UUID',
      infectionRate: 'number (0-1)',
      recoveryRate: 'number (0-1)',
      mortalityRate: 'number (0-1)',
      totalDays: 'number',
      mobilityFactor: 'number (connectivity strength)',
    },
  },

  [EVENTS.SIMULATION_DAY_ADVANCED]: {
    eventType: EVENTS.SIMULATION_DAY_ADVANCED,
    timestamp: 'ISO8601',
    simulationId: 'UUID',
    data: {
      day: 'number',
      totalInfected: 'number',
      totalRecovered: 'number',
      totalDeaths: 'number',
      regionsAffected: 'number',
    },
  },

  [EVENTS.INFECTION_UPDATED]: {
    eventType: EVENTS.INFECTION_UPDATED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    simulationId: 'UUID',
    data: {
      susceptible: 'number',
      infected: 'number',
      recovered: 'number',
      deaths: 'number',
      severity: 'enum: low|medium|high|critical',
      day: 'number',
      changeInInfected: 'number (delta)',
    },
  },

  [EVENTS.INFECTION_SPREAD]: {
    eventType: EVENTS.INFECTION_SPREAD,
    timestamp: 'ISO8601',
    simulationId: 'UUID',
    data: {
      fromRegionId: 'UUID',
      toRegionId: 'UUID',
      newInfectedCount: 'number',
      day: 'number',
    },
  },

  [EVENTS.OUTBREAK_DECLARED]: {
    eventType: EVENTS.OUTBREAK_DECLARED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    simulationId: 'UUID',
    data: {
      severity: 'enum: low|medium|high|critical',
      infectedCount: 'number',
      day: 'number',
    },
  },

  [EVENTS.RESOURCES_REQUESTED]: {
    eventType: EVENTS.RESOURCES_REQUESTED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    simulationId: 'UUID',
    data: {
      beds: { required: 'number', available: 'number', shortage: 'number' },
      vaccines: { required: 'number', available: 'number', shortage: 'number' },
      oxygen: { required: 'number', available: 'number', shortage: 'number' },
      priority: 'number (0-100)',
    },
  },

  [EVENTS.RESOURCES_ALLOCATED]: {
    eventType: EVENTS.RESOURCES_ALLOCATED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    simulationId: 'UUID',
    data: {
      beds: 'number (allocated)',
      vaccines: 'number (allocated)',
      oxygen: 'number (allocated)',
      allocationStrategy: 'string (e.g., severity-based)',
    },
  },

  [EVENTS.SHORTAGE_DETECTED]: {
    eventType: EVENTS.SHORTAGE_DETECTED,
    timestamp: 'ISO8601',
    regionId: 'UUID',
    simulationId: 'UUID',
    data: {
      resourceType: 'string (beds|vaccines|oxygen)',
      shortageAmount: 'number',
      severity: 'enum: low|medium|high|critical',
    },
  },

  [EVENTS.SERVICE_FAILED]: {
    eventType: EVENTS.SERVICE_FAILED,
    timestamp: 'ISO8601',
    serviceName: 'string',
    data: {
      reason: 'string',
      affectedEndpoints: 'string[]',
      severity: 'enum: warning|critical',
      retryAttempts: 'number',
      nextRetryAt: 'ISO8601 (optional)',
    },
  },

  [EVENTS.SERVICE_RECOVERED]: {
    eventType: EVENTS.SERVICE_RECOVERED,
    timestamp: 'ISO8601',
    serviceName: 'string',
    data: {
      recoveredAt: 'ISO8601',
      durationMs: 'number',
      affectedEndpoints: 'string[]',
    },
  },

  [EVENTS.HEALTH_CHECK]: {
    eventType: EVENTS.HEALTH_CHECK,
    timestamp: 'ISO8601',
    serviceName: 'string',
    data: {
      status: 'enum: healthy|degraded|unhealthy',
      responseTimeMs: 'number',
      lastSuccessfulCheck: 'ISO8601',
    },
  },

  [EVENTS.SYSTEM_ALERT]: {
    eventType: EVENTS.SYSTEM_ALERT,
    timestamp: 'ISO8601',
    data: {
      alertType: 'string',
      severity: 'enum: low|medium|high|critical',
      message: 'string',
      affectedServices: 'string[]',
    },
  },
};

/**
 * Create a properly formatted event
 * @param {string} eventType - Type of event
 * @param {string} sourceId - UUID or service name
 * @param {object} data - Event payload data
 * @returns {object} - Formatted event
 */
export function createEvent(eventType, sourceId, data) {
  const event = {
    eventType,
    timestamp: new Date().toISOString(),
    data: data || {},
  };

  // Add ID field based on event type and source
  if (eventType.includes('region')) {
    event.regionId = sourceId;
  } else if (eventType.includes('simulation')) {
    event.simulationId = sourceId;
  } else if (eventType.includes('service')) {
    event.serviceName = sourceId;
  }

  validateEvent(event);
  return event;
}

export default EVENT_SCHEMAS;
