const express = require('express');
const router = express.Router();
const { generateDailyQR, getTodayQR, validateQR } = require('../controllers/qrController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/generate', protect, adminOnly, generateDailyQR);
router.get('/today', protect, getTodayQR);
router.post('/validate', protect, validateQR);

module.exports = router;
