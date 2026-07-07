// backend/models/Revenue.js
import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['tour', 'hotel'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentReference: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Indexes for analytics
revenueSchema.index({ date: 1, type: 1 });
revenueSchema.index({ userId: 1 });

const Revenue = mongoose.model('Revenue', revenueSchema);
export default Revenue;