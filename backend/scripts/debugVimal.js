const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const debugVimal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find user by name Vimal or similar
        const users = await User.find({ name: { $regex: 'vimal', $options: 'i' } });

        console.log(`Found ${users.length} users matching 'vimal':`);
        users.forEach(u => {
            console.log(`\nUser: ${u.name} (${u.email})`);
            console.log(`Role: ${u.role}`);
            console.log(`ChefProfile Exists: ${!!u.chefProfile}`);
            if (u.chefProfile) {
                console.log(`ChefProfile:`, u.chefProfile);
            }
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugVimal();
