const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetPassword = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = process.argv[2];
        const newPassword = process.argv[3];

        if (!email || !newPassword) {
            console.log('Usage: node resetAdminPassword.js <email> <newPassword>');
            process.exit(1);
        }

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User not found with email: ${email}`);
            process.exit(1);
        }

        if (user.role === 'admin') {
            if (email === 'admin@foodie.com') {
                console.log('Fixing invalid role "admin" to "superAdmin"');
                user.role = 'superAdmin';
            } else {
                console.log('Fixing invalid role "admin" to "user"');
                user.role = 'user';
            }
        }

        user.password = newPassword;
        await user.save();

        console.log(`Password for ${email} has been reset successfully.`);
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

resetPassword();
