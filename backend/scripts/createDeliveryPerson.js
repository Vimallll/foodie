const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDeliveryPerson = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const deliveryEmail = process.argv[2] || 'delivery@foodie.com';
    const deliveryPassword = process.argv[3] || 'delivery123';
    const deliveryName = process.argv[4] || 'Delivery Person';

    // Check if delivery person already exists
    const existingDelivery = await User.findOne({ email: deliveryEmail });
    if (existingDelivery) {
      console.log('Delivery person already exists. Updating role...');
      existingDelivery.role = 'delivery';
      existingDelivery.isAvailable = true;
      await existingDelivery.save();
      console.log('Delivery person role updated successfully!');
      process.exit(0);
    }

    // Create new delivery person
    const deliveryPerson = await User.create({
      name: deliveryName,
      email: deliveryEmail,
      password: deliveryPassword,
      role: 'delivery',
      isAvailable: true,
    });

    console.log('Delivery person created successfully!');
    console.log('Email:', deliveryPerson.email);
    console.log('Password:', deliveryPassword);
    console.log('Role:', deliveryPerson.role);
    console.log('Available:', deliveryPerson.isAvailable);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating delivery person:', error);
    process.exit(1);
  }
};

createDeliveryPerson();

