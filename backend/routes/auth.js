const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// Configure multer for CSV upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Public routes
router.post('/firebase', authController.firebaseAuth);

// Protected routes
router.get('/profile', protect, authController.getProfile);

// Admin routes
router.get('/users', protect, adminOnly, authController.getAllUsers);
router.get('/students', protect, adminOnly, authController.getStudents);
router.post('/users', protect, adminOnly, authController.addUser);
router.post('/users/upload', protect, adminOnly, upload.single('file'), authController.uploadUsers);
router.patch('/users/:userId/toggle-block', protect, adminOnly, authController.toggleBlock);
router.delete('/users/:userId', protect, adminOnly, authController.deleteUser);

module.exports = router;
