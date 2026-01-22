/**
 * Script to check a user's role by phone number or email
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const checkUserRole = async () => {
  try {
    await connectDB();

    const phoneNumber = process.argv[2];
    
    if (!phoneNumber) {
      console.error('❌ Please provide a phone number as argument');
      console.log('Usage: node scripts/checkUserRole.js <phoneNumber>');
      process.exit(1);
    }

    const user = await User.findOne({
      $or: [
        { phone: phoneNumber },
        { phoneNumber: phoneNumber },
      ],
    });

    if (!user) {
      console.log('❌ User not found with phone number:', phoneNumber);
      process.exit(1);
    }

    console.log('\n📋 User Information:');
    console.log('   ID:', user._id);
    console.log('   Name:', user.name || user.fullName);
    console.log('   Phone:', user.phone || user.phoneNumber);
    console.log('   Email:', user.email || 'Not provided');
    console.log('   Role:', user.role);
    console.log('   isActive:', user.isActive);
    console.log('   isVerified:', user.isVerified);
    console.log('   isPhoneVerified:', user.isPhoneVerified);
    console.log('   availabilityStatus:', user.availabilityStatus);

    if (user.role !== 'delivery') {
      console.log('\n⚠️  WARNING: User role is not "delivery"');
      console.log('   This user will not be able to access delivery routes.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking user role:', error);
    process.exit(1);
  }
};

checkUserRole();



