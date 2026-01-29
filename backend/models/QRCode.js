const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    qrImage: {
        type: String // Base64 QR image
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexing
qrCodeSchema.index({ code: 1 });
qrCodeSchema.index({ type: 1, date: 1 }); // Not unique anymore
qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired codes immediately

module.exports = mongoose.model('QRCode', qrCodeSchema);
