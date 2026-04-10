require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { simulateSpread } = require('./services/simulationLogic');
const { query: dbQuery } = require('../../shared/db/database');
const SimulationService = require('./services/simulationService');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Initialize simulation service
const simService = new SimulationService(
  { query: dbQuery },
  null // EventBus will be initialized if available
);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Simulation service is running' });
});

// Legacy endpoint - kept for backward compatibility
app.post('/simulate', async (req, res) => {
  try {
    const { regionId, spreadFactor } = req.body;
    
    if (!regionId) {
      return res.status(400).json({ success: false, error: 'regionId is required' });
    }
    
    if (!spreadFactor || spreadFactor <= 0) {
      return res.status(400).json({ success: false, error: 'spreadFactor is required and must be > 0' });
    }
    
    const result = await simulateSpread(regionId, spreadFactor);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Region not found') {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// NEW PRODUCTION ENDPOINTS

/**
 * Create a new simulation
 * POST /simulation/create
 * Body: { sourceRegionId, infectionRate, recoveryRate, mortalityRate, totalDays, mobilityFactor }
 */
app.post('/simulation/create', async (req, res) => {
  try {
    const {
      sourceRegionId,
      infectionRate = 0.15,
      recoveryRate = 0.10,
      mortalityRate = 0.02,
      totalDays = 180,
      mobilityFactor = 1.0,
    } = req.body;

    if (!sourceRegionId) {
      return res.status(400).json({ success: false, error: 'sourceRegionId is required' });
    }

    // Validate region exists
    const regionResult = await dbQuery('SELECT * FROM regions WHERE id = $1', [sourceRegionId]);
    if (regionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Region not found' });
    }

    const simulation = await simService.createSimulation({
      sourceRegionId,
      infectionRate,
      recoveryRate,
      mortalityRate,
      totalDays,
      mobilityFactor,
    });

    res.json({
      success: true,
      data: simulation,
      message: 'Simulation created successfully',
    });
  } catch (error) {
    console.error('Error creating simulation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Run a simulation
 * POST /simulation/:id/run
 */
app.post('/simulation/:id/run', async (req, res) => {
  try {
    const simulationId = parseInt(req.params.id);

    const result = await simService.runSimulation(simulationId);

    res.json({
      success: true,
      data: result,
      message: 'Simulation completed successfully',
    });
  } catch (error) {
    console.error('Error running simulation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get simulation results
 * GET /simulation/:id/results
 */
app.get('/simulation/:id/results', async (req, res) => {
  try {
    const simulationId = parseInt(req.params.id);

    const results = await simService.getSimulationResults(simulationId);

    if (!results.simulation) {
      return res.status(404).json({ success: false, error: 'Simulation not found' });
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get region status during simulation
 * GET /simulation/region/:regionId/status
 */
app.get('/simulation/region/:regionId/status', async (req, res) => {
  try {
    const regionId = parseInt(req.params.regionId);

    const status = await simService.getRegionSimulationStatus(regionId);

    res.json({
      success: true,
      data: status || { message: 'No simulation data for this region' },
    });
  } catch (error) {
    console.error('Error fetching region status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get all simulations
 * GET /simulations
 */
app.get('/simulations', async (req, res) => {
  try {
    const result = await dbQuery(
      'SELECT * FROM simulations ORDER BY created_at DESC LIMIT 50'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching simulations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Simulation service running on port ${PORT}`);
  console.log(`Production endpoints:`);
  console.log(`  POST   /simulation/create`);
  console.log(`  POST   /simulation/:id/run`);
  console.log(`  GET    /simulation/:id/results`);
  console.log(`  GET    /simulation/region/:regionId/status`);
  console.log(`  GET    /simulations`);
});
