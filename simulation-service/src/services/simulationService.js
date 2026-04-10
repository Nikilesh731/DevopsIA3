/**
 * Advanced Simulation Logic Service
 * Orchestrates multi-day epidemic simulation across Indian regions
 * Handles region-to-region spread and resource tracking
 */

const EpidemicModel = require('./epidemicModel');

class SimulationService {
  constructor(db, eventBus) {
    this.db = db;
    this.eventBus = eventBus;
  }

  /**
   * Create and initialize a new simulation
   */
  async createSimulation(config) {
    const {
      sourceRegionId,
      infectionRate = 0.15,
      recoveryRate = 0.10,
      mortalityRate = 0.02,
      totalDays = 180,
      mobilityFactor = 1.0,
    } = config;

    // Insert simulation record
    const query = `
      INSERT INTO simulations 
      (source_region_id, infection_rate, recovery_rate, mortality_rate, total_days, mobility_factor, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;

    const result = await this.db.query(query, [
      sourceRegionId,
      infectionRate,
      recoveryRate,
      mortalityRate,
      totalDays,
      mobilityFactor,
    ]);

    return result.rows[0];
  }

  /**
   * Start and run a full simulation day-by-day
   */
  async runSimulation(simulationId) {
    try {
      const sim = await this._getSimulation(simulationId);
      if (!sim) throw new Error('Simulation not found');

      // Update status to running
      await this._updateSimulationStatus(simulationId, 'running', new Date());

      const model = new EpidemicModel({
        infectionRate: sim.infection_rate,
        recoveryRate: sim.recovery_rate,
        mortalityRate: sim.mortality_rate,
        mobilityFactor: sim.mobility_factor,
      });

      // Get all regions for network spread
      const regionQuery = 'SELECT * FROM regions ORDER BY id';
      const regionsResult = await this.db.query(regionQuery);
      const regionsMap = {};
      regionsResult.rows.forEach(r => {
        regionsMap[r.id] = r;
      });

      // Simulation state
      let peakInfections = 0;
      let peakDay = 0;
      let totalDeaths = 0;
      let dailyData = [];

      // Day-by-day loop
      for (let day = 1; day <= sim.total_days; day++) {
        const daySnapshot = {
          totalSusceptible: 0,
          totalInfected: 0,
          totalRecovered: 0,
          totalDeaths: 0,
          spreadingRegions: [],
          regionUpdates: {},
        };

        // Update each region
        for (const [regionId, region] of Object.entries(regionsMap)) {
          const connectedRegions = region.connected_regions 
            ? JSON.parse(region.connected_regions)
            : [];

          // Simulate spread from connected regions (randomly select one)
          let spreadFromConnected = 0;
          if (connectedRegions.length > 0 && Math.random() < 0.3) {
            const neighborName = connectedRegions[Math.floor(Math.random() * connectedRegions.length)];
            const neighbor = regionsResult.rows.find(r => r.name === neighborName);
            if (neighbor && neighbor.infected > 0) {
              spreadFromConnected = Math.floor(neighbor.infected * 0.02);
            }
          }

          // Run epidemic model for this region
          const dailyChange = model.simulateDay(
            {
              susceptible: region.susceptible,
              infected: region.infected,
              recovered: region.recovered,
              deaths: region.deaths,
              population: region.population,
            },
            spreadFromConnected
          );

          // Update region metrics
          daySnapshot.regionUpdates[regionId] = dailyChange;
          daySnapshot.totalSusceptible += dailyChange.susceptible;
          daySnapshot.totalInfected += dailyChange.infected;
          daySnapshot.totalRecovered += dailyChange.recovered;
          daySnapshot.totalDeaths += dailyChange.deaths;

          if (dailyChange.newInfections > 0) {
            daySnapshot.spreadingRegions.push(region.name);
          }

          // Update region in database
          await this._updateRegionDaily(
            regionId,
            dailyChange,
            day,
            sim.id
          );

          // Track peak
          if (dailyChange.infected > peakInfections) {
            peakInfections = dailyChange.infected;
            peakDay = day;
          }

          // Update region memory for next day
          regionsMap[regionId] = {
            ...region,
            susceptible: dailyChange.susceptible,
            infected: dailyChange.infected,
            recovered: dailyChange.recovered,
            deaths: dailyChange.deaths,
          };
        }

        totalDeaths = daySnapshot.totalDeaths;

        // Store daily snapshot
        await this._storeDailyData(simulationId, day, daySnapshot);

        // Publish daily event
        if (this.eventBus) {
          this.eventBus.publish('SIMULATION.DAY_COMPLETE', {
            simulationId,
            day,
            snapshot: daySnapshot,
            timestamp: new Date(),
          });
        }

        // Check if epidemic has ended (< 10 infected nationwide)
        if (daySnapshot.totalInfected < 10) {
          break;
        }
      }

      // Update simulation completion
      await this._updateSimulationCompletion(simulationId, {
        status: 'completed',
        totalInfected: daySnapshot.totalInfected,
        totalRecovered: daySnapshot.totalRecovered,
        totalDeaths,
        peakInfections,
        peakDay,
      });

      // Publish completion event
      if (this.eventBus) {
        this.eventBus.publish('SIMULATION.COMPLETE', {
          simulationId,
          peakInfections,
          peakDay,
          totalDeaths,
          timestamp: new Date(),
        });
      }

      return {
        simulationId,
        status: 'completed',
        peakInfections,
        peakDay,
        totalDeaths,
      };
    } catch (error) {
      await this._updateSimulationStatus(simulationId, 'failed');
      throw error;
    }
  }

  /**
   * Get simulation by ID
   */
  async _getSimulation(simulationId) {
    const result = await this.db.query(
      'SELECT * FROM simulations WHERE id = $1',
      [simulationId]
    );
    return result.rows[0];
  }

  /**
   * Update region daily metrics
   */
  async _updateRegionDaily(regionId, dailyChange, day, simulationId) {
    const updateQuery = `
      UPDATE regions 
      SET 
        susceptible = $1,
        infected = $2,
        recovered = $3,
        deaths = $4,
        risk_level = $5,
        last_update_day = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;

    await this.db.query(updateQuery, [
      dailyChange.susceptible,
      dailyChange.infected,
      dailyChange.recovered,
      dailyChange.deaths,
      dailyChange.riskLevel,
      day,
      regionId,
    ]);

    // Store in history
    const historyQuery = `
      INSERT INTO infection_history
      (region_id, simulation_id, day, susceptible, infected, recovered, deaths, severity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await this.db.query(historyQuery, [
      regionId,
      simulationId,
      day,
      dailyChange.susceptible,
      dailyChange.infected,
      dailyChange.recovered,
      dailyChange.deaths,
      dailyChange.riskLevel,
    ]);
  }

  /**
   * Store daily data snapshot
   */
  async _storeDailyData(simulationId, day, snapshot) {
    const query = `
      INSERT INTO simulation_daily_data
      (simulation_id, day, susceptible, infected, recovered, deaths, spreading_regions)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.db.query(query, [
      simulationId,
      day,
      snapshot.totalSusceptible,
      snapshot.totalInfected,
      snapshot.totalRecovered,
      snapshot.totalDeaths,
      JSON.stringify(snapshot.spreadingRegions),
    ]);
  }

  /**
   * Update simulation status
   */
  async _updateSimulationStatus(simulationId, status, timestamp = null) {
    const query = `
      UPDATE simulations 
      SET status = $1, ${timestamp ? 'started_at = $2,' : ''} updated_at = CURRENT_TIMESTAMP
      WHERE id = ${timestamp ? '$3' : '$2'}
    `;

    const params = timestamp ? [status, timestamp, simulationId] : [status, simulationId];
    await this.db.query(query, params);
  }

  /**
   * Update simulation completion metrics
   */
  async _updateSimulationCompletion(simulationId, metrics) {
    const query = `
      UPDATE simulations 
      SET 
        status = $1,
        total_infected = $2,
        total_recovered = $3,
        total_deaths = $4,
        peak_infections = $5,
        peak_day = $6,
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;

    await this.db.query(query, [
      metrics.status,
      metrics.totalInfected,
      metrics.totalRecovered,
      metrics.totalDeaths,
      metrics.peakInfections,
      metrics.peakDay,
      simulationId,
    ]);
  }

  /**
   * Get simulation results with daily breakdown
   */
  async getSimulationResults(simulationId) {
    const simQuery = 'SELECT * FROM simulations WHERE id = $1';
    const simResult = await this.db.query(simQuery, [simulationId]);
    
    const dailyQuery = `
      SELECT * FROM simulation_daily_data 
      WHERE simulation_id = $1 
      ORDER BY day
    `;
    const dailyResult = await this.db.query(dailyQuery, [simulationId]);

    return {
      simulation: simResult.rows[0],
      dailyData: dailyResult.rows,
    };
  }

  /**
   * Get region status during simulation
   */
  async getRegionSimulationStatus(regionId) {
    const query = `
      SELECT * FROM infection_history 
      WHERE region_id = $1 
      ORDER BY day DESC 
      LIMIT 1
    `;

    const result = await this.db.query(query, [regionId]);
    return result.rows[0] || null;
  }
}

module.exports = SimulationService;
