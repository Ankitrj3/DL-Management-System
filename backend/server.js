require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');
const attendanceRoutes = require('./routes/attendance');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'DL Management System API is running',
        version: '1.0.0 Firebase Auth'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server!'
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
