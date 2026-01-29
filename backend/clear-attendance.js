const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const QRCode = require('./models/QRCode');
require('dotenv').config();

const clearAttendanceData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system');
        console.log('Connected to MongoDB');

        // Get count before deletion
        const attendanceCount = await Attendance.countDocuments();
        const qrCount = await QRCode.countDocuments();
        
        console.log(`Found ${attendanceCount} attendance records`);
        console.log(`Found ${qrCount} QR code records`);

        // Clear all attendance records
        const attendanceResult = await Attendance.deleteMany({});
        console.log(`Deleted ${attendanceResult.deletedCount} attendance records`);

        // Clear all QR code records
        const qrResult = await QRCode.deleteMany({});
        console.log(`Deleted ${qrResult.deletedCount} QR code records`);

        console.log('✅ All attendance data cleared successfully!');
        
    } catch (error) {
        console.error('❌ Error clearing attendance data:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
};

// Run the script
clearAttendanceData();