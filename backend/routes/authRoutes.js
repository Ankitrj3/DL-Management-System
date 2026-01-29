const express = require('express');
const router = express.Router();
const { login, adminLogin, getProfile, getAllStudents } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/profile', protect, getProfile);
router.get('/students', protect, adminOnly, getAllStudents);

module.exports = router;
