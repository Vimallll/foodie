const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  distance: {
    type: Number, // in kilometers
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  tip: {
    type: Number,
    default: 0,
  },
  payoutDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
earningsSchema.index({ deliveryPartner: 1, createdAt: -1 });
earningsSchema.index({ order: 1 });
earningsSchema.index({ payoutDate: -1 });

module.exports = mongoose.model('Earnings', earningsSchema);

