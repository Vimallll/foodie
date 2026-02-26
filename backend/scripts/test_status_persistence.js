const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = "mongodb+srv://JenishVariya:Jp%4004302099@cluster0.fvkjt8v.mongodb.net/foodie";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const randomNum = Math.floor(Math.random() * 10000);
        // Create a test user
        const testEmail = `test_delivery_${Date.now()}@example.com`;
        const testPhone = `123456${randomNum}`;

        console.log('Creating user with phone:', testPhone);

        const testUser = await User.create({
            name: 'Test Delivery',
            fullName: 'Test Delivery',
            email: testEmail,
            role: 'delivery',
            password: 'password123',
            phone: testPhone,
            phoneNumber: testPhone,
            vehicleType: 'bike',
            vehicleNumber: 'KA01AB1234',
            drivingLicenseNumber: 'DL1234567890',
            status: 'ONLINE',
            availabilityStatus: 'ONLINE',
            isVerified: true,
            isActive: true
        });

        console.log(`Created user: ${testUser._id}, status: ${testUser.availabilityStatus}`);

        // Update to OFFLINE
        testUser.availabilityStatus = 'OFFLINE';
        testUser.status = 'OFFLINE';
        testUser.isAvailable = false;
        await testUser.save();
        console.log('Updated to OFFLINE via save()');

        // Fetch again (simulate reload)
        const reFetchedUser = await User.findById(testUser._id);
        console.log(`Re-fetched user: ${reFetchedUser._id}, status: ${reFetchedUser.availabilityStatus}`);

        if (reFetchedUser.availabilityStatus !== 'OFFLINE') {
            console.error('FAIL: Status did not persist as OFFLINE');
        } else {
            console.log('PASS: Status persisted as OFFLINE');
        }

        // Clean up
        await User.findByIdAndDelete(testUser._id);
        console.log('Cleaned up test user');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error [${key}]: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

run();
