const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetVimal = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find user by name Vimal
        const user = await User.findOne({ name: { $regex: 'vimal', $options: 'i' } });

        if (user) {
            console.log(`Resetting user: ${user.name} (${user.email})`);
            user.chefProfile = undefined;
            user.role = 'user'; // Ensure role is user
            await user.save();
            console.log('Reset complete.');
        } else {
            console.log('User Vimal not found');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetVimal();
