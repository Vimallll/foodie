const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const activateDelivery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodie');
    console.log('✅ MongoDB Connected');

    const phoneNumber = process.argv[2];

    if (!phoneNumber) {
      console.log('Usage: node scripts/activateDelivery.js <phone-number>');
      console.log('Example: node scripts/activateDelivery.js 9876543210');
      process.exit(1);
    }

    // Find delivery partner by phone number
    const deliveryPartner = await User.findOne({
      $or: [
        { phone: phoneNumber },
        { phoneNumber: phoneNumber },
      ],
      role: 'delivery',
    });

    if (!deliveryPartner) {
      console.log(`❌ Delivery partner with phone number ${phoneNumber} not found`);
      process.exit(1);
    }

    // Activate the account and verify phone for testing
    deliveryPartner.isActive = true;
    deliveryPartner.isPhoneVerified = true;
    // Clear OTP fields since we're verifying
    deliveryPartner.phoneOtp = undefined;
    deliveryPartner.phoneOtpExpiry = undefined;
    await deliveryPartner.save();

    console.log(`✅ Successfully activated delivery partner account!`);
    console.log(`   Phone: ${deliveryPartner.phoneNumber || deliveryPartner.phone}`);
    console.log(`   Name: ${deliveryPartner.fullName || deliveryPartner.name}`);
    console.log(`   Email: ${deliveryPartner.email || 'N/A'}`);
    console.log(`   isActive: ${deliveryPartner.isActive}`);
    console.log(`   isVerified: ${deliveryPartner.isVerified}`);
    console.log(`   isPhoneVerified: ${deliveryPartner.isPhoneVerified}`);
    console.log(`   isEmailVerified: ${deliveryPartner.isEmailVerified || false}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error activating delivery partner:', error.message);
    process.exit(1);
  }
};

activateDelivery();

