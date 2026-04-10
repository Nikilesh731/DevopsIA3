const express = require('express');
const router = express.Router();
const { getInventory, getAllocations, allocateResource } = require('../controllers/resourceController');

router.get('/inventory', getInventory);
router.get('/allocations', getAllocations);
router.post('/allocate', allocateResource);

module.exports = router;
