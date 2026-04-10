require('dotenv').config();
const express = require('express');
const cors = require('cors');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Resource service is running' });
});

app.use('/api/resources', resourceRoutes);

app.listen(PORT, () => {
  console.log(`Resource service running on port ${PORT}`);
});
