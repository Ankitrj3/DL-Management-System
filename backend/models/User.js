const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
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
    sparse: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
