require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Lazy load database and services to prevent crashes during startup
let dbQuery = null;
let SimulationService = null;
let simService = null;
let dbReady = false;

const initializeServices = async () => {
  try {
    if (dbReady) return;
    
    const dbModule = require('../../shared/db/database.cjs');
    dbQuery = dbModule.query;
    SimulationService = require('./services/simulationService');
    
    simService = new SimulationService(
      { query: dbQuery },
      null // EventBus will be initialized if available
    );
    
    dbReady = true;
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error.message);
    dbReady = false;
    // Don't crash - we'll retry on next request
  }
};

// Initialize services on first request
const ensureServicesReady = async (req, res, next) => {
  if (!dbReady) {
    try {
      await initializeServices();
    } catch (error) {
      console.error('Service initialization failed:', error);
    }
  }
  next();
};

app.use(ensureServicesReady);

// Health check - always available
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Simulation service is running',
    ready: dbReady
  });
});

// Legacy endpoint - kept for backward compatibility
app.post('/simulate', async (req, res) => {
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Service not yet initialized' });
  }
  
  try {
    const { regionId, sourceRegionId, spreadFactor, mobilityFactor } = req.body;
    const simulationRegionId = sourceRegionId || regionId;

    if (!simulationRegionId) {
      return res.status(400).json({ success: false, error: 'regionId is required' });
    }

    const resolvedMobilityFactor = mobilityFactor || spreadFactor || 1.0;

    if (!resolvedMobilityFactor || resolvedMobilityFactor <= 0) {
      return res.status(400).json({ success: false, error: 'mobilityFactor is required and must be > 0' });
    }

    const simulation = await simService.createSimulation({
      sourceRegionId: simulationRegionId,
      mobilityFactor: resolvedMobilityFactor,
    });

    res.status(201).json({ success: true, data: simulation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW PRODUCTION ENDPOINTS

/**
 * Create a new simulation
 * POST /simulation/create
 * Body: { sourceRegionId, infectionRate, recoveryRate, mortalityRate, totalDays, mobilityFactor }
 */
app.post('/simulation/create', async (req, res) => {
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Service not yet initialized' });
  }

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
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Service not yet initialized' });
  }

  try {
    const simulationId = parseInt(req.params.id);
    const result = await simService.runSimulation(simulationId);
    res.json({
      success: true,
      data: result,
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
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Service not yet initialized' });
  }

  try {
    const simulationId = parseInt(req.params.id);
    const result = await simService.getSimulationResults(simulationId);
    res.json({
      success: true,
      data: result,
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
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Service not yet initialized' });
  }

  try {
    const regionId = parseInt(req.params.regionId);
    const result = await simService.getRegionSimulationStatus(regionId);
    res.json({
      success: true,
      data: result,
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
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Service not yet initialized' });
  }

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

// Start server - will continue running even if database isn't ready
const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Simulation Service Starting`);
  console.log(`========================================`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  console.log(`\nProduction Endpoints:`);
  console.log(`  POST   /simulation/create`);
  console.log(`  POST   /simulation/:id/run`);
  console.log(`  GET    /simulation/:id/results`);
  console.log(`  GET    /simulation/region/:regionId/status`);
  console.log(`  GET    /simulations`);
  console.log(`\nHealth Check: GET /health`);
  console.log(`========================================\n`);
  
  // Try to initialize services
  initializeServices().catch(err => {
    console.error('Initial service initialization failed:', err.message);
    console.log('Will retry on first request...');
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
