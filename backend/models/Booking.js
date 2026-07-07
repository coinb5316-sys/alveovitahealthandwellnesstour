// backend/models/Booking.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['tour', 'hotel'],
    required: true,
  },
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
  },
  tourTitle: {
    type: String,
  },
  hotelName: {
    type: String,
  },
  destination: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  nights: {
    type: Number,
    default: 1,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentReference: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
  },
  specialRequests: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
  // Soft delete fields
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deletedFor: {
    type: String,
    enum: ['user', 'admin', 'all'],
    default: 'user',
  },
}, { timestamps: true });

// Indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ isDeleted: 1, deletedFor: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;