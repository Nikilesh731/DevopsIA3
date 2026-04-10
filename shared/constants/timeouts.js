/**
 * Service Communication Timeouts and Retry Constants
 */

export const TIMEOUTS = {
  // HTTP request timeouts (milliseconds)
  HTTP_REQUEST: process.env.HTTP_TIMEOUT || 5000,
  HTTP_LONG_POLL: process.env.LONG_POLL_TIMEOUT || 30000,

  // Service health check intervals
  HEALTH_CHECK_INTERVAL: process.env.HEALTH_CHECK_INTERVAL || 10000,
  HEALTH_CHECK_TIMEOUT: process.env.HEALTH_CHECK_TIMEOUT || 3000,

  // Event bus operations
  EVENT_BUS_TIMEOUT: process.env.EVENT_BUS_TIMEOUT || 5000,

  // Simulation step timeout
  SIMULATION_STEP_TIMEOUT: process.env.SIMULATION_STEP_TIMEOUT || 10000,

  // Resource allocation timeout
  RESOURCE_ALLOCATION_TIMEOUT: process.env.RESOURCE_ALLOCATION_TIMEOUT || 5000,
};

export const RETRY_CONFIG = {
  // Number of retry attempts
  MAX_ATTEMPTS: 3,

  // Initial backoff delay (milliseconds)
  INITIAL_BACKOFF: 100,

  // Maximum backoff delay (milliseconds)
  MAX_BACKOFF: 5000,

  // Exponential backoff multiplier
  BACKOFF_MULTIPLIER: 2,

  // Whether to retry on 5xx errors
  RETRY_ON_SERVER_ERROR: true,

  // Whether to retry on network errors
  RETRY_ON_NETWORK_ERROR: true,

  // Whether to retry on timeout
  RETRY_ON_TIMEOUT: true,
};

export const CIRCUIT_BREAKER = {
  // Number of failures before opening circuit
  FAILURE_THRESHOLD: 5,

  // Number of successes to close circuit
  SUCCESS_THRESHOLD: 2,

  // Time to attempt recovery (milliseconds)
  TIMEOUT: 60000,

  // Half-open state duration
  HALF_OPEN_TIMEOUT: 30000,
};

export default TIMEOUTS;
