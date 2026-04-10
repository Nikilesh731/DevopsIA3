require('dotenv').config();
const express = require('express');
const cors = require('cors');
const regionRoutes = require('./routes/regionRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'region-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/regions', regionRoutes);

app.listen(PORT, () => {
  console.log(`Region service running on port ${PORT}`);
});
