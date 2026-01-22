const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const updateAdminToSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodie');
    console.log('✅ MongoDB Connected');

    const adminEmail = process.argv[2] || 'admin@foodie.com';

    // Find admin user
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log(`❌ User with email ${adminEmail} not found`);
      process.exit(1);
    }

    // Update to superAdmin - use findByIdAndUpdate to bypass validation
    const updatedAdmin = await User.findByIdAndUpdate(
      admin._id,
      { role: 'superAdmin' },
      { new: true, runValidators: false }
    );

    console.log(`✅ Successfully updated ${adminEmail} to superAdmin!`);
    console.log(`   Name: ${updatedAdmin.name}`);
    console.log(`   Email: ${updatedAdmin.email}`);
    console.log(`   Role: ${updatedAdmin.role}`);
    console.log('\n⚠️  Please log out and log back in to refresh your session!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    process.exit(1);
  }
};

updateAdminToSuperAdmin();

