/**
 * Event Bus Service
 * Central event aggregation, logging, and streaming
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { eventBus } from './eventBus.js';
import { SERVICE_PORTS } from '../../../shared/constants/servicePorts.js';
import { validateEvent } from '../../../shared/events/eventSchemas.js';
import createLogger from '../../../shared/utils/logger.js';

dotenv.config();

const app = express();
const logger = createLogger('event-bus');
const PORT = SERVICE_PORTS.EVENT_BUS;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.logRequest(req.method, req.path, req.query);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'event-bus',
    timestamp: new Date().toISOString(),
    subscriberCount: eventBus.getSubscriberCount(),
    eventCount: eventBus.eventHistory.length,
  });
});

// Publish event endpoint
app.post('/api/events', (req, res) => {
  try {
    const event = req.body;

    // Validate event
    validateEvent(event);

    // Emit event
    eventBus.emit(event);

    logger.logEvent(event.eventType, { id: event.regionId || event.simulationId });

    res.status(201).json({
      success: true,
      message: 'Event received and processed',
      eventType: event.eventType,
      timestamp: event.timestamp,
    });
  } catch (error) {
    logger.error('Failed to process event', { error: error.message });
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get event stream (polling endpoint)
app.get('/api/events/stream', (req, res) => {
  try {
    const { eventType = null, limit = 100 } = req.query;
    const history = eventBus.getHistory(eventType, parseInt(limit) || 100);

    res.json({
      success: true,
      eventCount: history.length,
      events: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to retrieve event stream', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get events by type
app.get('/api/events/:eventType', (req, res) => {
  try {
    const { eventType } = req.params;
    const { limit = 50 } = req.query;
    const history = eventBus.getHistory(eventType, parseInt(limit) || 50);

    res.json({
      success: true,
      eventType,
      eventCount: history.length,
      events: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear history (admin endpoint)
app.delete('/api/events/history/clear', (req, res) => {
  try {
    eventBus.clearHistory();
    res.json({
      success: true,
      message: 'Event history cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Empty root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'event-bus',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Event bus service running on port ${PORT}`);
});

export default app;
