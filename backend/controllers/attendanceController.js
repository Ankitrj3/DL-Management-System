const Attendance = require('../models/Attendance');
const QRCode = require('../models/QRCode');
const { Parser } = require('json2csv');
const { google } = require('googleapis');

const getTodayDate = () => {
    // Use local timezone for consistent date handling
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Google Sheets Sync Helper
const syncToSheets = async (data) => {
    try {
        console.log('🔄 Attempting to sync to Google Sheets:', data);
        
        if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            console.log('❌ Google Sheets config missing, skipping sync');
            console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? 'Set' : 'Missing');
            console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Set' : 'Missing');
            return;
        }

        const auth = new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            null,
            process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        const rowData = [
            data.date,
            data.name,
            data.email,
            data.type.toUpperCase(),
            new Date(data.time).toLocaleTimeString('en-IN'),
            `${data.duration || 0} mins`
        ];

        console.log('📊 Data to write to sheets:', rowData);

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [rowData]
            }
        });
        console.log('✅ Successfully synced to Google Sheets');
    } catch (error) {
        console.error('❌ Google Sheets Sync Error:', error.message);
        if (error.message.includes('API has not been used')) {
            console.log('💡 Enable Google Sheets API at: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview');
        }
        if (error.message.includes('403')) {
            console.log('💡 Check service account permissions on the Google Sheet');
        }
    }
};

// Punch attendance (IN or OUT)
exports.punchAttendance = async (req, res) => {
    try {
        const { qrData } = req.body;
        const user = req.user;
        const today = getTodayDate();

        console.log('Punch attendance request:', { qrData, userId: user._id, today });

        // Parse QR data
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
            console.log('Parsed QR data:', parsedData);
        } catch (parseError) {
            console.error('QR parse error:', parseError);
            return res.status(400).json({ message: 'Invalid QR code format' });
        }

        const { code, type } = parsedData;

        if (!code || !type || !['in', 'out'].includes(type)) {
            console.error('Invalid QR data:', { code, type });
            return res.status(400).json({ message: 'Invalid QR code data' });
        }

        // Validate QR code - check if valid (15s expiration + 5s buffer for network delays)
        const qr = await QRCode.findOne({
            code,
            date: today,
            type,
            expiresAt: { $gte: new Date(Date.now() - 5000) } // 5s buffer for network delays
        });

        console.log('QR validation result:', { 
            found: !!qr, 
            code, 
            type, 
            today, 
            currentTime: new Date(),
            qrExpiresAt: qr?.expiresAt 
        });

        if (!qr) {
            return res.status(400).json({ message: 'QR code is invalid or has expired. Please scan a fresh code.' });
        }

        // Get or create today's attendance
        let attendance = await Attendance.findOne({ user: user._id, date: today });

        if (!attendance) {
            console.log('Creating new attendance record for user:', user._id);
            attendance = await Attendance.create({
                user: user._id,
                email: user.email,
                name: user.name,
                date: today,
                punches: [],
                currentStatus: 'out'
            });
        }

        // Check if user can punch
        if (type === 'in' && attendance.currentStatus === 'in') {
            return res.status(400).json({
                message: 'You are already checked IN. Please check OUT before checking in again.',
                currentStatus: attendance.currentStatus
            });
        }

        if (type === 'out' && attendance.currentStatus === 'out') {
            return res.status(400).json({
                message: 'You are already checked OUT. Please check IN first.',
                currentStatus: attendance.currentStatus
            });
        }

        // Add punch
        const now = new Date();
        console.log('Adding punch:', { type, time: now, userId: user._id });
        
        attendance.punches.push({ type, time: now });
        attendance.currentStatus = type;

        // Calculate duration if checking out
        let punchDuration = 0;
        if (type === 'out' && attendance.punches.length >= 2) {
            const lastInPunch = [...attendance.punches].reverse().find(p => p.type === 'in');
            if (lastInPunch) {
                punchDuration = Math.round((now - new Date(lastInPunch.time)) / 60000); // minutes
                attendance.totalDuration += punchDuration;
            }
        }

        await attendance.save();
        console.log('Attendance saved successfully:', { attendanceId: attendance._id, punches: attendance.punches.length });

        // Sync to Google Sheets in background
        syncToSheets({
            date: today,
            name: user.name,
            email: user.email,
            type,
            time: now,
            duration: punchDuration
        });

        res.json({
            message: type === 'in' ? 'Checked IN successfully! Welcome.' : 'Checked OUT successfully! Goodbye.',
            type,
            time: now,
            attendance: {
                date: attendance.date,
                currentStatus: attendance.currentStatus,
                punches: attendance.punches,
                totalDuration: attendance.totalDuration
            }
        });
    } catch (error) {
        console.error('Punch attendance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user's today status
exports.getTodayStatus = async (req, res) => {
    try {
        const today = getTodayDate();
        const attendance = await Attendance.findOne({ user: req.user._id, date: today });

        const hasPunched = attendance && attendance.punches.length > 0;

        res.json({
            date: today,
            hasAttendance: !!attendance,
            hasPunched,
            currentStatus: attendance?.currentStatus || 'out',
            punches: attendance?.punches || [],
            totalDuration: attendance?.totalDuration || 0,
            attendance: hasPunched ? {
                date: attendance.date,
                status: attendance.currentStatus,
                punchTime: attendance.punches[attendance.punches.length - 1]?.time, // Latest punch time
                punches: attendance.punches,
                totalDuration: attendance.totalDuration
            } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's attendance history
exports.getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(30);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all attendance
exports.getAllAttendance = async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1, createdAt: -1 })
            .populate('user', 'email name');

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get today's attendance
exports.getTodayAttendance = async (req, res) => {
    try {
        const today = getTodayDate();
        const attendance = await Attendance.find({ date: today })
            .sort({ createdAt: -1 })
            .populate('user', 'email name');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get stats
exports.getStats = async (req, res) => {
    try {
        const today = getTodayDate();

        const todayCount = await Attendance.countDocuments({ date: today });
        const currentlyIn = await Attendance.countDocuments({ date: today, currentStatus: 'in' });
        const totalRecords = await Attendance.countDocuments();
        const uniqueDays = await Attendance.distinct('date');

        res.json({
            todayCount,
            currentlyIn,
            totalRecords,
            totalDays: uniqueDays.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get Google Sheets URL
exports.getGoogleSheetsUrl = async (req, res) => {
    try {
        const sheetsId = process.env.GOOGLE_SHEETS_ID;
        if (!sheetsId) {
            return res.status(404).json({ message: 'Google Sheets not configured' });
        }

        const url = `https://docs.google.com/spreadsheets/d/${sheetsId}/edit`;
        res.json({ 
            url,
            configured: true,
            message: 'Google Sheets is configured and syncing attendance data'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.downloadCSV = async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .populate('user', 'email name');

        // Flatten punches for CSV
        const flatData = [];
        for (const record of attendance) {
            for (const punch of record.punches) {
                flatData.push({
                    Date: record.date,
                    Name: record.name || record.user?.name,
                    Email: record.email,
                    Type: punch.type.toUpperCase(),
                    Time: new Date(punch.time).toLocaleTimeString('en-IN'),
                    TotalDuration: `${record.totalDuration} mins`
                });
            }
        }

        if (flatData.length === 0) {
            return res.status(404).json({ message: 'No attendance records found' });
        }

        const fields = ['Date', 'Name', 'Email', 'Type', 'Time', 'TotalDuration'];
        const parser = new Parser({ fields });
        const csv = parser.parse(flatData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`attendance_${date || 'all'}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
