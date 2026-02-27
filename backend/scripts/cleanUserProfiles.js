const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const cleanUserProfiles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find users who have chefProfile but kitchenName is missing/empty
        // AND who are NOT homeChef role
        const users = await User.find({
            role: 'user',
            'chefProfile.kitchenName': { $exists: false }
        });

        console.log(`Found ${users.length} users with potentially empty chefProfile.`);

        for (const user of users) {
            console.log(`Cleaning user: ${user.name} (${user.email})`);
            user.chefProfile = undefined;
            await user.save();
        }

        console.log('Cleanup complete.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanUserProfiles();
