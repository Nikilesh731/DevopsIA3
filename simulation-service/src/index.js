require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { simulateSpread } = require('./services/simulationLogic');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Simulation service is running' });
});

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

app.listen(PORT, () => {
  console.log(`Simulation service running on port ${PORT}`);
});
