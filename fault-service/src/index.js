const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const faultRoutes = require('./routes/faultRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: "Fault service is running" });
});

app.use('/api/faults', faultRoutes);

app.listen(PORT, () => {
  console.log(`Fault service running on port ${PORT}`);
});
