const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please add a category'],
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    // required: [true, 'Please add a restaurant'], // Made optional for Home Kitchen
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  foodType: {
    type: String,
    enum: ['restaurant', 'home'],
    default: 'restaurant',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  preparationTime: {
    type: Number,
    default: 20, // minutes
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  ingredients: {
    type: String, // Comma separated list for simplicity
    default: ''
  },
  isSpecial: {
    type: Boolean, // Today's Special
    default: false
  },
  // Simple structure for custom options (e.g., "Spice Level: Low, Medium, High")
  customOptions: [{
    name: String,
    choices: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Food', foodSchema);

