const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const checkDeliveryStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodie');
    console.log('✅ MongoDB Connected');

    const phoneNumber = process.argv[2];

    if (!phoneNumber) {
      console.log('Usage: node scripts/checkDeliveryStatus.js <phone-number>');
      console.log('Example: node scripts/checkDeliveryStatus.js 9510613534');
      process.exit(1);
    }

    // Find all delivery partners with this phone number
    const deliveryPartners = await User.find({
      $or: [
        { phone: phoneNumber },
        { phoneNumber: phoneNumber },
      ],
      role: 'delivery',
    });

    if (deliveryPartners.length === 0) {
      console.log(`❌ No delivery partner found with phone number ${phoneNumber}`);
      process.exit(1);
    }

    console.log(`\n📱 Found ${deliveryPartners.length} delivery partner(s) with phone ${phoneNumber}:\n`);
    
    deliveryPartners.forEach((partner, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Delivery Partner #${index + 1}:`);
      console.log(`   ID: ${partner._id}`);
      console.log(`   Name: ${partner.fullName || partner.name}`);
      console.log(`   Phone: ${partner.phoneNumber || partner.phone}`);
      console.log(`   Email: ${partner.email || 'N/A'}`);
      console.log(`   Role: ${partner.role}`);
      console.log(`   isActive: ${partner.isActive} ${partner.isActive ? '✅' : '❌'}`);
      console.log(`   active: ${partner.active} ${partner.active ? '✅' : '❌'}`);
      console.log(`   isVerified: ${partner.isVerified}`);
      console.log(`   isPhoneVerified: ${partner.isPhoneVerified}`);
      console.log(`   isEmailVerified: ${partner.isEmailVerified || false}`);
      console.log(`   availabilityStatus: ${partner.availabilityStatus}`);
      console.log(`   status: ${partner.status}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking delivery partner:', error.message);
    process.exit(1);
  }
};

checkDeliveryStatus();




