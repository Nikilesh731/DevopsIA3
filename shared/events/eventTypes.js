/**
 * Central Event Type Registry
 * All services publish and consume from this standardized set of event types
 * Ensures consistency across the distributed epidemic simulation system
 */

export const EVENTS = {
  // Region lifecycle
  REGION_CREATED: 'region.created',
  REGION_UPDATED: 'region.updated',
  REGION_DELETED: 'region.deleted',

  // Simulation lifecycle
  SIMULATION_STARTED: 'simulation.started',
  SIMULATION_DAY_ADVANCED: 'simulation.day.advanced',
  SIMULATION_COMPLETED: 'simulation.completed',
  SIMULATION_PAUSED: 'simulation.paused',
  SIMULATION_RESUMED: 'simulation.resumed',

  // Infection progression
  INFECTION_DETECTED: 'infection.detected',
  INFECTION_UPDATED: 'infection.updated',
  INFECTION_SPREAD: 'infection.spread',
  OUTBREAK_DECLARED: 'outbreak.declared',
  OUTBREAK_CONTAINED: 'outbreak.contained',

  // Resource demand & allocation
  RESOURCES_REQUESTED: 'resources.requested',
  RESOURCES_ALLOCATED: 'resources.allocated',
  SHORTAGE_DETECTED: 'shortage.detected',
  SHORTAGE_RESOLVED: 'shortage.resolved',

  // Service health
  SERVICE_FAILED: 'service.failed',
  SERVICE_RECOVERED: 'service.recovered',
  HEALTH_CHECK: 'health.check',
  HEALTH_CHECK_FAILED: 'health.check.failed',

  // System
  EVENT_LOG_CREATED: 'event.log.created',
  SYSTEM_ALERT: 'system.alert',
};

// Event priority levels
export const EVENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Severity levels for outbreaks
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export default EVENTS;
