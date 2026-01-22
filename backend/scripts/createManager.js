const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createManager = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodie');
    console.log('✅ Connected to MongoDB');

    // Get manager details from command line arguments
    const args = process.argv.slice(2);
    const name = args[0] || 'Manager';
    const email = args[1] || `manager@foodie.com`;
    const password = args[2] || 'manager123';

    // Check if manager already exists
    const existingManager = await User.findOne({ email: email });

    if (existingManager) {
      console.log('❌ User already exists with this email');
      console.log('Existing user:', existingManager.email, 'Role:', existingManager.role);
      process.exit(1);
    }

    // Get restaurant name from arguments (optional)
    const restaurantName = args[3];
    let restaurantId = null;
    
    if (restaurantName) {
      const Restaurant = require('../models/Restaurant');
      const restaurant = await Restaurant.findOne({ name: restaurantName });
      if (restaurant) {
        restaurantId = restaurant._id;
        console.log(`📍 Restaurant found: ${restaurantName}`);
      } else {
        console.log(`⚠️  Restaurant "${restaurantName}" not found. Manager will be created without restaurant assignment.`);
      }
    }

    // Create manager
    const manager = await User.create({
      name: name,
      email: email,
      password: password,
      role: 'manager',
      restaurant: restaurantId,
    });

    console.log('✅ Manager created successfully!');
    console.log('📧 Email:', manager.email);
    console.log('👤 Name:', manager.name);
    console.log('🔑 Role:', manager.role);
    console.log('🔐 Password:', password);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating manager:', error.message);
    process.exit(1);
  }
};

createManager();

