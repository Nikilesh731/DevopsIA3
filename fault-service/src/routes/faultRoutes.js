const express = require('express');
const router = express.Router();
const faultController = require('../controllers/faultController');

router.get('/status', faultController.getStatus);
router.put('/fail', faultController.failService);
router.put('/recover', faultController.recoverService);

module.exports = router;
