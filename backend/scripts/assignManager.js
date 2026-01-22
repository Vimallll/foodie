const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const assignManager = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodie');
    console.log('✅ MongoDB Connected');

    const userEmail = process.argv[2];
    const restaurantName = process.argv[3];

    if (!userEmail || !restaurantName) {
      console.log('Usage: node scripts/assignManager.js <user-email> <restaurant-name>');
      console.log('Example: node scripts/assignManager.js manager@burgerhouse.com "Burger House"');
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      process.exit(1);
    }

    // Find restaurant
    const restaurant = await Restaurant.findOne({ name: restaurantName });
    if (!restaurant) {
      console.log(`❌ Restaurant "${restaurantName}" not found`);
      process.exit(1);
    }

    // Update user to manager role and assign restaurant
    // Use findByIdAndUpdate to bypass validation for delivery-specific fields
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        role: 'manager',
        restaurant: restaurant._id,
        // Unset delivery-specific fields if they exist
        $unset: {
          vehicleType: '',
          vehicleNumber: '',
          drivingLicenseNumber: '',
          profilePhoto: '',
          phoneOtp: '',
          phoneOtpExpiry: '',
          emailVerificationToken: '',
          emailVerificationExpiry: '',
        }
      },
      { new: true, runValidators: false }
    );

    console.log(`✅ Successfully assigned ${userEmail} as manager of "${restaurantName}"`);
    console.log(`   User role: ${updatedUser.role}`);
    console.log(`   Restaurant: ${restaurant.name}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error assigning manager:', error.message);
    process.exit(1);
  }
};

assignManager();

