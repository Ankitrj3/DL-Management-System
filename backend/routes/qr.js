const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes
router.post('/generate', protect, adminOnly, qrController.generateQR);
router.get('/today', protect, qrController.getTodayQR);
router.post('/validate', protect, qrController.validateQR);

module.exports = router;
