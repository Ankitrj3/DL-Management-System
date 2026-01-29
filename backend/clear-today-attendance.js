const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const QRCode = require('./models/QRCode');
require('dotenv').config();

const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const clearTodayAttendance = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system');
        console.log('Connected to MongoDB');

        const today = getTodayDate();
        console.log(`Clearing attendance data for: ${today}`);

        // Get count before deletion
        const todayAttendanceCount = await Attendance.countDocuments({ date: today });
        const todayQrCount = await QRCode.countDocuments({ date: today });
        
        console.log(`Found ${todayAttendanceCount} attendance records for today`);
        console.log(`Found ${todayQrCount} QR code records for today`);

        // Clear today's attendance records
        const attendanceResult = await Attendance.deleteMany({ date: today });
        console.log(`Deleted ${attendanceResult.deletedCount} attendance records for today`);

        // Clear today's QR code records
        const qrResult = await QRCode.deleteMany({ date: today });
        console.log(`Deleted ${qrResult.deletedCount} QR code records for today`);

        console.log(`✅ Today's attendance data (${today}) cleared successfully!`);
        
    } catch (error) {
        console.error('❌ Error clearing today\'s attendance data:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run the script
clearTodayAttendance();