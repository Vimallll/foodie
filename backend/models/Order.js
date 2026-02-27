const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  // Restaurant location for delivery calculations
  restaurantLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP', 'ON_THE_WAY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
  },
  paymentMethod: {
    type: String,
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Delivery specific fields
  pickedUpAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  estimatedDistance: {
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
  // Estimated times (in minutes)
  estimatedPreparationTime: {
    type: Number,
    default: 20, // Default 20 minutes
  },
  estimatedDeliveryTime: {
    type: Number,
    default: 30, // Default 30 minutes total
  },
  // Timestamps for tracking
  acceptedAt: {
    type: Date,
    default: null,
  },
  preparingAt: {
    type: Date,
    default: null,
  },
  readyAt: {
    type: Date,
    default: null,
  },
  assignedToDeliveryAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
});

// Update updatedAt before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
