const mongoose = require('mongoose');

const punchSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now,
        validate: {
            validator: function(v) {
                return v instanceof Date && !isNaN(v);
            },
            message: 'Invalid time format'
        }
    }
});

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    punches: [punchSchema],
    currentStatus: {
        type: String,
        enum: ['in', 'out'],
        default: 'out'
    },
    totalDuration: {
        type: Number, // Total minutes inside
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for unique user-date combination
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ email: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
