/**
 * Realistic SIR (Susceptible-Infected-Recovered) Epidemic Model
 * Production-level epidemic simulation engine
 * Based on epidemiological principles
 */

class EpidemicModel {
  constructor(config = {}) {
    this.infectionRate = config.infectionRate || 0.15;        // β - transmission rate
    this.recoveryRate = config.recoveryRate || 0.10;           // γ - recovery rate (1/infectious period)
    this.mobilityFactor = config.mobilityFactor || 1.0;        // Movement multiplier
    this.mortalityRate = config.mortalityRate || 0.02;         // CFR - case fatality rate
    this.incubationPeriod = config.incubationPeriod || 5;      // Days before symptoms
    this.contactRate = config.contactRate || 15;               // Baseline contacts per infected person per day
  }

  /**
   * Simulate one day of epidemic spread in a region
   * Returns daily change metrics
   */
  simulateDay(regionData, spreadingFromConnected = 0) {
    const { susceptible, infected, recovered, deaths, population } = regionData;
    
    if (infected === 0 && spreadingFromConnected === 0) {
      return this._noSpreadDay(regionData);
    }

    // Force of infection (lambda) - probability a susceptible gets infected
    const totalInfectious = infected + spreadingFromConnected;
    const contactsPerDay = this.contactRate * this.mobilityFactor;
    const probabilityTransmission = this.infectionRate;
    
    // New infections using mass action principle
    const forceOfInfection = 1 - Math.exp(-(contactsPerDay * totalInfectious * probabilityTransmission) / population);
    const newInfections = Math.floor(susceptible * forceOfInfection);
    
    // Recovery flow (includes both recovered and deaths)
    const recoveryOutflow = Math.floor(infected * this.recoveryRate);
    const deathsFromInfected = Math.floor(recoveryOutflow * this.mortalityRate);
    const newRecoveries = recoveryOutflow - deathsFromInfected;

    // Spread to connected regions (travel/mobility)
    const spreadToConnected = Math.floor(infected * 0.12 * this.mobilityFactor);

    // Calculate new compartments
    const newSusceptible = Math.max(0, susceptible - newInfections);
    const newInfected = Math.max(0, infected + newInfections - recoveryOutflow);
    const newRecovered = recovered + newRecoveries;
    const newDeaths = deaths + deathsFromInfected;

    // Calculate severity metrics
    const riskLevel = this._calculateRiskLevel(newInfected, population);
    const infectionRate = (newInfected / population) * 100000; // per 100,000 population

    return {
      susceptible: newSusceptible,
      infected: newInfected,
      recovered: newRecovered,
      deaths: newDeaths,
      newInfections,
      newRecoveries,
      newDeaths: deathsFromInfected,
      spreadToConnected,
      riskLevel,
      infectionRate,
      reproductionNumber: this._calculateR0(newInfections, infected),
    };
  }

  /**
   * Calculate current reproduction number (Rt)
   */
  _calculateR0(newInfections, currentInfected) {
    if (currentInfected === 0) return 0;
    return (newInfections / currentInfected) * (1 / this.recoveryRate);
  }

  /**
   * Determine epidemic risk level
   */
  _calculateRiskLevel(infected, population) {
    const incidenceRate = (infected / population) * 100000; // per 100,000 population
    
    if (incidenceRate > 500) return 'CRITICAL';
    if (incidenceRate > 200) return 'HIGH';
    if (incidenceRate > 50) return 'MEDIUM';
    if (incidenceRate > 10) return 'LOW';
    return 'MINIMAL';
  }

  /**
   * Day with no spread
   */
  _noSpreadDay(regionData) {
    return {
      susceptible: regionData.susceptible,
      infected: regionData.infected,
      recovered: regionData.recovered,
      deaths: regionData.deaths,
      newInfections: 0,
      newRecoveries: 0,
      newDeaths: 0,
      spreadToConnected: 0,
      riskLevel: 'MINIMAL',
      infectionRate: 0,
      reproductionNumber: 0,
    };
  }

  /**
   * Calculate resource demand based on infection levels
   */
  calculateResourceDemand(infected, riskLevel) {
    const hospitalizationRate = 0.05;  // 5% need hospitalization
    const icuRate = 0.02;              // 2% need ICU
    const oxygenRate = 0.03;           // 3% need oxygen

    return {
      beds: Math.ceil(infected * hospitalizationRate),
      icuBeds: Math.ceil(infected * icuRate),
      oxygen: Math.ceil(infected * oxygenRate),
      vaccines: Math.ceil(infected * 0.1),
      severity: riskLevel,
    };
  }

  /**
   * Check if epidemic is under control (Rt < 1)
   */
  isUnderControl(reproductionNumber) {
    return reproductionNumber < 1.0;
  }

  /**
   * Estimate peak day and peak infections
   */
  estimatePeak(initialInfected, susceptible, population) {
    // Simple logistic model estimation
    const R0 = this.infectionRate / this.recoveryRate;
    const herdImmunityThreshold = 1 - (1 / R0);
    
    if (R0 <= 1) return { peakDay: 0, peakInfections: initialInfected };

    // Estimate days to peak using exponential growth phase
    const growthRate = (this.infectionRate - this.recoveryRate);
    const daysToMaxGrowth = Math.log((population - susceptible) / initialInfected) / growthRate;
    
    // Peak infections (logistic): I_peak ≈ population * (1 - 1/R0 - ln(R0)/R0)
    const peakInfections = Math.floor(population * (1 - (1 / R0) - (Math.log(R0) / R0)));

    return {
      peakDay: Math.ceil(daysToMaxGrowth),
      peakInfections: Math.max(initialInfected, peakInfections),
    };
  }
}

module.exports = EpidemicModel;
