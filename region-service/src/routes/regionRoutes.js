const express = require('express');
const router = express.Router();
const { createRegion, getAllRegions, updateInfection, getAnalytics, getRegionsByPriority } = require('../controllers/regionController');

router.post('/', createRegion);
router.get('/', getAllRegions);
router.put('/:id/infect', updateInfection);
router.get('/analytics/priority', getRegionsByPriority);
router.get('/analytics', getAnalytics);

module.exports = router;
