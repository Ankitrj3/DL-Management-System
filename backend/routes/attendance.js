const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.post('/punch', protect, attendanceController.punchAttendance);
router.get('/status', protect, attendanceController.getTodayStatus);
router.get('/my', protect, attendanceController.getMyAttendance);

// Admin routes
router.get('/all', protect, adminOnly, attendanceController.getAllAttendance);
router.get('/today', protect, adminOnly, attendanceController.getTodayAttendance);
router.get('/stats', protect, adminOnly, attendanceController.getStats);
router.get('/sheets-url', protect, adminOnly, attendanceController.getGoogleSheetsUrl);
router.get('/download', protect, adminOnly, attendanceController.downloadCSV);

module.exports = router;
