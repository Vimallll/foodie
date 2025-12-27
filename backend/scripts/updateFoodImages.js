const mongoose = require('mongoose');
const Food = require('../models/Food');
require('dotenv').config();

const updateFoodImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Update Fish & Chips image
    const fishAndChips = await Food.findOne({ name: 'Fish & Chips' });
    if (fishAndChips) {
      fishAndChips.image = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop';
      await fishAndChips.save();
      console.log('✓ Updated Fish & Chips image');
    } else {
      console.log('Fish & Chips not found in database');
    }

    // Update Hot Dog image
    const hotDog = await Food.findOne({ name: 'Hot Dog' });
    if (hotDog) {
      hotDog.image = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop';
      await hotDog.save();
      console.log('✓ Updated Hot Dog image');
    } else {
      console.log('Hot Dog not found in database');
    }

    console.log('\nImage updates completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating food images:', error);
    process.exit(1);
  }
};

updateFoodImages();

