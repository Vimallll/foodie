const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const testUserCreation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const testEmail = `testuser_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Test Auto Profile',
            email: testEmail,
            password: 'password123'
        });

        console.log(`Created user: ${user.email}`);
        console.log('Does chefProfile exist?', !!user.chefProfile);
        if (user.chefProfile) {
            console.log('chefProfile contents:', user.chefProfile);
            console.log('chefStatus:', user.chefProfile.chefStatus);
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        console.log('Test user deleted.');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testUserCreation();
