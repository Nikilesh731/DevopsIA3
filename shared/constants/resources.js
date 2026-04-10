/**
 * Medical Resource Type Definitions and Constants
 */

export const RESOURCE_TYPES = {
  BEDS: 'beds',
  VACCINES: 'vaccines',
  OXYGEN: 'oxygen',
  MEDICAL_TEAMS: 'medical_teams',
};

export const RESOURCE_UNITS = {
  BEDS: 'units',
  VACCINES: 'doses',
  OXYGEN: 'tanks',
  MEDICAL_TEAMS: 'teams',
};

// Default resource availability per 1 million population
export const DEFAULT_RESOURCE_CAPACITY = {
  BEDS: 500,
  VACCINES: 100000,
  OXYGEN: 5000,
  MEDICAL_TEAMS: 50,
};

// Minimum critical resource thresholds (below which shortages are declared)
export const CRITICAL_THRESHOLDS = {
  BEDS: 0.5, // 50% utilization
  VACCINES: 0.3, // 30% of supply
  OXYGEN: 0.4, // 40% of supply
  MEDICAL_TEAMS: 0.6, // 60% of teams
};

// Resource allocation priority weights
export const ALLOCATION_PRIORITY_WEIGHTS = {
  INFECTION_COUNT: 0.4, // 40% based on infected count
  SEVERITY_LEVEL: 0.3, // 30% based on outbreak severity
  MORTALITY_RISK: 0.2, // 20% based on mortality rate
  RESOURCE_DEPLETION_RISK: 0.1, // 10% based on depletion risk
};

// Distribution strategy definitions
export const DISTRIBUTION_STRATEGIES = {
  EQUAL: 'equal', // Divide equally among regions
  SEVERITY_BASED: 'severity_based', // Prioritize high-severity regions
  DEMAND_BASED: 'demand_based', // Allocate based on calculated demand
  AVAILABILITY_BASED: 'availability_based', // Based on proximity and availability
};

export default RESOURCE_TYPES;
