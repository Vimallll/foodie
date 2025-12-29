const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

const assignRestaurantAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const userEmail = process.argv[2];
    const restaurantName = process.argv[3];

    if (!userEmail || !restaurantName) {
      console.log('Usage: node assignRestaurantAdmin.js <user-email> <restaurant-name>');
      console.log('Example: node assignRestaurantAdmin.js admin@restaurant.com "Burger House"');
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      process.exit(1);
    }

    // Find restaurant
    const restaurant = await Restaurant.findOne({ name: restaurantName });
    if (!restaurant) {
      console.log(`Restaurant "${restaurantName}" not found`);
      process.exit(1);
    }

    // Update user
    user.role = 'restaurant_admin';
    user.restaurant = restaurant._id;
    await user.save();

    // Update restaurant
    restaurant.admin = user._id;
    await restaurant.save();

    console.log(`✓ Successfully assigned ${userEmail} as admin of "${restaurantName}"`);
    console.log(`User role updated to: ${user.role}`);
    console.log(`Restaurant admin set to: ${user.name}`);

    process.exit(0);
  } catch (error) {
    console.error('Error assigning restaurant admin:', error);
    process.exit(1);
  }
};

assignRestaurantAdmin();

