const express = require('express');
const router = express.Router();
const {
    punchAttendance,
    getMyAttendance,
    getTodayStatus,
    getAllAttendance,
    getTodayAttendance,
    downloadCSV,
    getAttendanceStats
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/punch', protect, punchAttendance);
router.get('/my', protect, getMyAttendance);
router.get('/status', protect, getTodayStatus);

router.get('/all', protect, adminOnly, getAllAttendance);
router.get('/today', protect, adminOnly, getTodayAttendance);
router.get('/download', protect, adminOnly, downloadCSV);
router.get('/stats', protect, adminOnly, getAttendanceStats);

module.exports = router;
