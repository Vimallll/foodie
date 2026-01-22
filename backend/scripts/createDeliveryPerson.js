const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDeliveryPerson = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Get arguments: email, password, name, phoneNumber, vehicleType, vehicleNumber, drivingLicenseNumber
    const deliveryEmail = process.argv[2] || 'delivery@foodie.com';
    const deliveryPassword = process.argv[3] || 'delivery123';
    const deliveryName = process.argv[4] || 'Delivery Person';
    const phoneNumber = process.argv[5] || '9876543210';
    const vehicleType = process.argv[6] || 'bike';
    const vehicleNumber = process.argv[7] || 'DL01AB1234';
    const drivingLicenseNumber = process.argv[8] || 'DL1234567890';

    // Check if delivery person already exists
    const existingDelivery = await User.findOne({ 
      $or: [
        { email: deliveryEmail },
        { phone: phoneNumber },
        { phoneNumber: phoneNumber }
      ],
      role: 'delivery'
    });
    
    if (existingDelivery) {
      console.log('⚠️ Delivery person already exists. Updating details...');
      existingDelivery.role = 'delivery';
      existingDelivery.name = deliveryName;
      existingDelivery.fullName = deliveryName;
      existingDelivery.email = deliveryEmail;
      existingDelivery.phone = phoneNumber;
      existingDelivery.phoneNumber = phoneNumber;
      existingDelivery.vehicleType = vehicleType;
      existingDelivery.vehicleNumber = vehicleNumber;
      existingDelivery.drivingLicenseNumber = drivingLicenseNumber;
      existingDelivery.isAvailable = true;
      existingDelivery.isActive = true;
      existingDelivery.isVerified = true; // Auto-verify for script creation
      existingDelivery.availabilityStatus = 'OFFLINE';
      existingDelivery.status = 'OFFLINE';
      
      if (deliveryPassword) {
        existingDelivery.password = deliveryPassword;
      }
      
      await existingDelivery.save();
      console.log('✅ Delivery person updated successfully!');
      console.log('📧 Email:', existingDelivery.email);
      console.log('📱 Phone:', existingDelivery.phoneNumber);
      console.log('🔑 Password:', deliveryPassword || '(unchanged)');
      console.log('🚚 Role:', existingDelivery.role);
      console.log('✅ Verified:', existingDelivery.isVerified);
      process.exit(0);
    }

    // Create new delivery person
    const deliveryPerson = await User.create({
      name: deliveryName,
      fullName: deliveryName,
      email: deliveryEmail,
      phone: phoneNumber,
      phoneNumber: phoneNumber,
      password: deliveryPassword,
      role: 'delivery',
      vehicleType: vehicleType,
      vehicleNumber: vehicleNumber,
      drivingLicenseNumber: drivingLicenseNumber,
      isAvailable: true,
      isActive: true,
      isVerified: true, // Auto-verify for script creation
      availabilityStatus: 'OFFLINE',
      status: 'OFFLINE',
    });

    console.log('✅ Delivery person created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', deliveryPerson.email);
    console.log('📱 Phone:', deliveryPerson.phoneNumber);
    console.log('🔑 Password:', deliveryPassword);
    console.log('👤 Name:', deliveryPerson.fullName);
    console.log('🚚 Vehicle Type:', deliveryPerson.vehicleType);
    console.log('🚗 Vehicle Number:', deliveryPerson.vehicleNumber);
    console.log('📄 License:', deliveryPerson.drivingLicenseNumber);
    console.log('✅ Verified:', deliveryPerson.isVerified);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 You can now login at: http://localhost:3000/delivery/login');
    console.log('   Use email/phone + password to login');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating delivery person:', error.message);
    process.exit(1);
  }
};

createDeliveryPerson();

