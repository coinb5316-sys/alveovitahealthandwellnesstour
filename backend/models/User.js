// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user',
},
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  avatar: { type: String, default: '' },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  googleId: { type: String, sparse: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Africa/Accra' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, default: '12h' },
    theme: { type: String, default: 'system' },
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
  },
  stats: {
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    membershipTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze',
    },
    favorites: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  }
}, { timestamps: true });

// Remove pre-save hook - we'll hash in the controller

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  try {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model('User', userSchema);
export default User;