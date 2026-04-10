/**
 * Disease and Epidemic Parameters
 * SIR (Susceptible-Infected-Recovered) Model Constants
 * Based on real epidemiological data
 */

// Default disease parameters (COVID-19 inspired, but fictional)
export const DISEASE_PARAMETERS = {
  // Basic reproduction number (average secondary infections per infected person)
  BASIC_REPRODUCTION_NUMBER: 2.5,

  // Infection rate per day (0-1, portion of susceptible population that gets infected)
  DEFAULT_INFECTION_RATE: 0.15,

  // Recovery rate per day (1/infectious_period)
  DEFAULT_RECOVERY_RATE: 0.10, // ~10 days infectious period

  // Mortality rate (0-1, portion of infected that die)
  DEFAULT_MORTALITY_RATE: 0.02,

  // Incubation period (days before symptoms appear)
  INCUBATION_PERIOD: 5,

  // Infectious period (days person is contagious)
  INFECTIOUS_PERIOD: 10,

  // Asymptomatic rate (portion of infected with no symptoms)
  ASYMPTOMATIC_RATE: 0.4,

  // Hospitalization rate (portion of infected needing hospital)
  HOSPITALIZATION_RATE: 0.05,

  // ICU admission rate
  ICU_ADMISSION_RATE: 0.02,

  // Vaccine effectiveness (0-1)
  VACCINE_EFFECTIVENESS: 0.90,

  // Vaccine coverage rate needed for herd immunity
  HERD_IMMUNITY_THRESHOLD: 0.70,
};

// Severity classification thresholds
export const SEVERITY_THRESHOLDS = {
  // Infected per 1,000 population
  LOW: 1, // < 1 per 1000
  MEDIUM: 5, // 1-5 per 1000
  HIGH: 20, // 5-20 per 1000
  CRITICAL: 50, // > 50 per 1000
};

// Resource consumption rates per infected person per day
export const RESOURCE_CONSUMPTION = {
  BEDS: {
    LOW: 0.01, // 1% of infected need bed
    MEDIUM: 0.05,
    HIGH: 0.15,
    CRITICAL: 0.25,
  },
  VACCINES: {
    LOW: 0.02,
    MEDIUM: 0.1,
    HIGH: 0.25,
    CRITICAL: 0.4,
  },
  OXYGEN: {
    LOW: 0.001,
    MEDIUM: 0.01,
    HIGH: 0.05,
    CRITICAL: 0.15,
  },
};

// Mobility factor impact on spread (0-1)
export const MOBILITY_FACTORS = {
  ISOLATED: 0.1, // Minimal travel
  LOW: 0.3, // Some restrictions
  NORMAL: 1.0, // Normal mobility
  HIGH: 1.5, // Increased mobility (pre-pandemic, vacation, etc.)
};

// Intervention effectiveness (reduces transmission)
export const INTERVENTIONS = {
  NONE: 1.0, // No reduction
  SOCIAL_DISTANCING: 0.7, // 30% reduction
  MASK_WEARING: 0.8, // 20% reduction
  LOCKDOWN: 0.3, // 70% reduction
  VACCINATION_CAMPAIGN: 0.6, // 40% reduction (via herd immunity)
  COMBINATION: 0.2, // 80% reduction (multiple measures)
};

export default DISEASE_PARAMETERS;
