const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String
  },
  firebaseUid: {
    type: String,
    sparse: true,
    index: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
    index: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false,
    index: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for common queries
userSchema.index({ role: 1, isBlocked: 1 });

module.exports = mongoose.model('User', userSchema);
