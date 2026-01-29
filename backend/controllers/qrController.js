const QRCode = require('qrcode');
const QRCodeModel = require('../models/QRCode');
const { v4: uuidv4 } = require('uuid');

const getTodayDate = () => {
    // Use local timezone for consistent date handling
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Generate QR code (IN or OUT)
exports.generateQR = async (req, res) => {
    try {
        const today = getTodayDate();
        const { type } = req.body; // 'in' or 'out'

        console.log('Generating QR code:', { type, today, userId: req.user._id });

        if (!['in', 'out'].includes(type)) {
            return res.status(400).json({ message: 'Invalid QR type' });
        }

        // Clean up expired QR codes for this type and date
        await QRCodeModel.deleteMany({
            type,
            date: today,
            expiresAt: { $lt: new Date() }
        });

        // Generate new QR code
        const code = `${type.toUpperCase()}-${uuidv4()}`;
        const timestamp = Date.now();
        const qrData = JSON.stringify({ code, type, date: today, timestamp });
        
        console.log('QR data to encode:', qrData);
        
        const qrImage = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        });

        const expiresAt = new Date(Date.now() + 15 * 1000); // 15s expiration to match frontend rotation
        console.log('QR expires at:', expiresAt);

        const newQR = await QRCodeModel.create({
            type,
            code,
            date: today,
            qrImage,
            createdBy: req.user._id,
            expiresAt
        });

        console.log('QR code created successfully:', { id: newQR._id, code, type });

        res.json({
            message: `${type.toUpperCase()} QR code generated`,
            date: today,
            qr: newQR
        });
    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get today's QR codes
exports.getTodayQR = async (req, res) => {
    try {
        const today = getTodayDate();

        const inQR = await QRCodeModel.findOne({ date: today, type: 'in' });
        const outQR = await QRCodeModel.findOne({ date: today, type: 'out' });

        if (!inQR && !outQR) {
            return res.status(404).json({ message: 'No QR codes for today' });
        }

        res.json({
            date: today,
            inQR,
            outQR
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validate QR code
exports.validateQR = async (req, res) => {
    try {
        const { code, type } = req.body;
        const today = getTodayDate();

        const qr = await QRCodeModel.findOne({ code, date: today, type });

        if (!qr) {
            return res.status(400).json({ valid: false, message: 'Invalid or expired QR code' });
        }

        res.json({ valid: true, type: qr.type, date: qr.date });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
