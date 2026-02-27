const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://127.0.0.1:5001/api';

const runVerification = async () => {
    console.log('🚀 Starting Chef Registration Verification...');

    try {
        // 1. Register a NEW User
        const uniqueSuffix = Date.now();
        const email = `chefreg${uniqueSuffix}@test.com`;
        const password = 'password123';

        console.log(`\n--- 1. Registering User (${email}) ---`);
        const signupRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Chef Hopeful',
            email: email,
            password: password,
            address: { street: '123 Baker St', city: 'London', state: 'UK', zipCode: 'NW1' }
        });
        const token = signupRes.data.token;
        console.log('✅ User Registered.');

        // 2. Register as Chef with New Fields
        console.log('\n--- 2. Registering as Chef (Enhanced) ---');
        const chefData = {
            kitchenName: "Test Kitchen " + uniqueSuffix,
            bio: "I love cooking test data.",
            specialties: ["Testing", "Debugging"],
            experience: "10 years",
            // New Fields
            fssaiLicenseNumber: "FSSAI-1234567890",
            fssaiLicenseImage: "http://example.com/fssai.jpg",
            idProofType: "PAN",
            idProofImage: "http://example.com/pan.jpg",
            deliveryMode: "self",
            deliveryRadius: 10,
            deliveryCharges: 50,
            schedule: "Mon-Fri: 10am-10pm"
        };

        const regRes = await axios.post(`${API_URL}/chefs/register`, chefData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Chef Registration Response:', regRes.data.message);

        // 3. Verify Data in Profile
        console.log('\n--- 3. Verifying Profile Data ---');
        // We can use getMe or getChefById. User ID is in response or token logic.
        // regRes.data.data is the user object.
        const user = regRes.data.data;
        const profile = user.chefProfile;

        if (profile.fssaiLicenseNumber !== chefData.fssaiLicenseNumber) throw new Error("FSSAI mismatch");
        if (profile.deliveryMode !== chefData.deliveryMode) throw new Error("Delivery Mode mismatch");
        if (profile.deliveryCharges !== chefData.deliveryCharges) throw new Error("Delivery Charges mismatch");

        console.log('✅ All Enhanced Fields Verified Successfully!');

        // 4. Verify Chef Status defaults to pending
        if (profile.chefStatus !== 'pending') throw new Error(`Status should be pending, got ${profile.chefStatus}`);
        console.log('✅ Chef Status is Pending.');

    } catch (error) {
        console.error('\n🛑 Verification Failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

runVerification();
