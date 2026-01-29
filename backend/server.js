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

// CORS configuration for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed?.includes('vercel.app') && origin.includes('vercel.app'))) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now, tighten in production if needed
        }
    },
    credentials: true
}));

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
