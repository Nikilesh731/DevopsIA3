/**
 * Event Types for Frontend
 * Mirrors shared event types for dashboard consumption
 */

export const EVENT_TYPES = {
  // Region lifecycle
  REGION_CREATED: 'region.created',
  REGION_UPDATED: 'region.updated',
  REGION_DELETED: 'region.deleted',

  // Simulation lifecycle
  SIMULATION_STARTED: 'simulation.started',
  SIMULATION_DAY_ADVANCED: 'simulation.day.advanced',
  SIMULATION_COMPLETED: 'simulation.completed',

  // Infection progression
  INFECTION_DETECTED: 'infection.detected',
  INFECTION_UPDATED: 'infection.updated',
  INFECTION_SPREAD: 'infection.spread',
  OUTBREAK_DECLARED: 'outbreak.declared',

  // Resource management
  RESOURCES_REQUESTED: 'resources.requested',
  RESOURCES_ALLOCATED: 'resources.allocated',
  SHORTAGE_DETECTED: 'shortage.detected',

  // Service health
  SERVICE_FAILED: 'service.failed',
  SERVICE_RECOVERED: 'service.recovered',
  HEALTH_CHECK: 'health.check',

  // System
  SYSTEM_ALERT: 'system.alert',
};

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export default EVENT_TYPES;
