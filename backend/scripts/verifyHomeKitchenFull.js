const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api'; // Ensure port matches server (5000 or 5001?)

// Admin Credentials (Default from createAdmin.js)
const ADMIN_EMAIL = 'admin@foodie.com';
const ADMIN_PASSWORD = 'admin123';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVerification() {
    console.log('🚀 Starting Home Kitchen Full Verification...');

    try {
        // 1. Health Check
        try {
            const healthRes = await axios.get(`${API_URL}/health`);
            console.log('✅ Backend Health Check:', healthRes.data);
        } catch (e) {
            console.error('❌ Backend Not Reachable. Is server running on port 5000?');
            return;
        }

        // 2. Admin Login
        let adminToken;
        try {
            console.log(`\n👮 Logging in as Admin (${ADMIN_EMAIL})...`);
            const adminLogin = await axios.post(`${API_URL}/auth/login`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            adminToken = adminLogin.data.token;
            console.log('✅ Admin Logged In');
        } catch (e) {
            console.error('❌ Admin Login Failed. Please run "npm run create-admin" first.');
            throw e;
        }

        // 3. Register New User & Apply for Home Chef
        const chefEmail = `chef_${Date.now()}@test.com`;
        const chefPassword = 'password123';
        const chefName = 'Gordon Test';

        console.log(`\n👨‍🍳 Registering Chef User: ${chefEmail}`);
        await axios.post(`${API_URL}/auth/register`, {
            name: chefName,
            email: chefEmail,
            password: chefPassword
        });

        const chefLogin = await axios.post(`${API_URL}/auth/login`, {
            email: chefEmail,
            password: chefPassword
        });
        const chefToken = chefLogin.data.token;
        console.log('✅ Chef Logged In');

        console.log('🍳 Applying to become Home Chef...');
        const chefRegisterRes = await axios.post(`${API_URL}/chefs/register`, {
            kitchenName: "Gordon's Test Kitchen",
            bio: "Best test food in town",
            specialties: ["Testing", "Debugging"],
            experience: "10 years",
            availability: { isAvailable: true, schedule: "24/7" }
        }, { headers: { 'Authorization': `Bearer ${chefToken}` } });

        const chefId = chefRegisterRes.data.data._id;
        console.log(`✅ Application Submitted. Chef ID: ${chefId}`);

        // 4. Try to Create Dish (Should Fail - Pending)
        console.log('\n🛑 Testing Permission: Chef tries to add dish while PENDING...');

        // Get a category first
        const categoriesRes = await axios.get(`${API_URL}/categories`);
        const categories = categoriesRes.data.categories || categoriesRes.data.data;
        if (!categories || categories.length === 0) throw new Error('No categories found. Run npm run seed-data.');
        const categoryId = categories[0]._id;

        try {
            await axios.post(`${API_URL}/foods`, {
                name: "Forbidden Pie",
                description: "Should not be created",
                price: 100,
                category: categoryId,
                foodType: 'home'
            }, { headers: { 'Authorization': `Bearer ${chefToken}` } });
            console.error('❌ FAIL: Dish creation succeeded but should have failed (Status is Pending)');
        } catch (e) {
            if (e.response && e.response.status === 403) {
                console.log('✅ PASS: Dish creation blocked as expected (403 Forbidden).');
            } else {
                console.error(`❌ FAIL: Unexpected error: ${e.message}`, e.response?.data);
            }
        }

        // 5. Admin Approves Chef
        console.log(`\n👮 Admin Approving Chef ${chefId}...`);
        try {
            await axios.put(`${API_URL}/super-admin/chef/${chefId}/status`, {
                status: 'approved'
            }, { headers: { 'Authorization': `Bearer ${adminToken}` } });
            console.log('✅ Chef Approved via API');
            console.log('📧 (Check backend logs for Email Sent message)');
        } catch (e) {
            console.error('❌ Admin Approval Failed:', e.message, e.response?.data);
            throw e;
        }

        // 6. Chef Creates Dish (Should Success)
        console.log('\n✅ Testing Permission: Chef tries to add dish after APPROVAL...');
        try {
            const dishRes = await axios.post(`${API_URL}/foods`, {
                name: "Victory Pie",
                description: "Created after approval",
                price: 500,
                category: categoryId,
                foodType: 'home'
            }, { headers: { 'Authorization': `Bearer ${chefToken}` } });
            console.log(`✅ PASS: Dish Created Successfully: ${dishRes.data.food.name}`);
        } catch (e) {
            console.error('❌ FAIL: Dish creation failed even after approval:', e.message, e.response?.data);
        }

        console.log('\n🎉 Verification Complete!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

runVerification();
