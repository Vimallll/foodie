const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const debugChefs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Check Counts matches Controller
        const countQuery = { 'chefProfile.chefStatus': 'pending' };
        const pendingCount = await User.countDocuments(countQuery);
        console.log(`\nPending Count (chefProfile.chefStatus = 'pending'): ${pendingCount}`);

        // 2. Check Find matches Controller
        const findQuery = {
            'chefProfile.kitchenName': { $exists: true },
            'chefProfile.chefStatus': 'pending'
        };
        const pendingChefs = await User.find(findQuery).select('name email role chefProfile.chefStatus chefProfile.kitchenName');
        console.log(`\nPending Chefs found via Query (${pendingChefs.length}):`);
        pendingChefs.forEach(c => {
            console.log(`- [${c._id}] ${c.name} (${c.email}) | Role: ${c.role} | Status: ${c.chefProfile?.chefStatus} | Kitchen: ${c.chefProfile?.kitchenName}`);
        });

        // 3. Check for anomalies
        console.log('\nChecking for anomalies...');
        const allPending = await User.find({ 'chefProfile.chefStatus': 'pending' });
        console.log(`Total Docs with chefStatus='pending': ${allPending.length}`);

        if (allPending.length !== pendingChefs.length) {
            console.log('MISMATCH DETECTED!');
            console.log('Docs with status pending but NO kitchenName?');
            const anomalyChefs = await User.find({
                'chefProfile.chefStatus': 'pending',
                'chefProfile.kitchenName': { $exists: false }
            });
            anomalyChefs.forEach(c => {
                console.log(`- [${c._id}] ${c.name} | KitchenName Exists: ${!!c.chefProfile?.kitchenName}`);
            });
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugChefs();
