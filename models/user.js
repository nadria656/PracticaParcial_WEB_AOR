const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  code: {
    type: String 
  },
  attempts: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'deleted'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['user', 'guest', 'admin'],
    default: 'user'
  },
  // Onboarding
  name: String,
  surname: String,
  nif: String,
  // Company
  company: {
    name: String,
    cif: String,
    address: String
  },
  logoUrl: String,

  resetCode: String,
  resetCodeExpiration: Date
});

module.exports = mongoose.model('User', userSchema);
