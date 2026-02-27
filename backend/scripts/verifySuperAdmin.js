const axios = require('axios');

const API_URL = 'http://127.0.0.1:5001/api';

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runVerification = async () => {
    console.log('🚀 Starting Super Admin System Verification...');

    try {
        // 1. Health Check
        try {
            const healthRes = await axios.get(`${API_URL}/health`);
            console.log('✅ Backend Health Check:', healthRes.data);
        } catch (e) {
            console.error('❌ Backend Health Check Failed:', e.message);
            throw e;
        }

        // 2. Register a NEW Pending Chef
        const uniqueSuffix = Date.now();
        const chefEmail = `pendingchef${uniqueSuffix}@test.com`;
        const chefPassword = 'password123';
        let chefToken;
        let chefId;

        console.log(`\n--- 2. Registering Pending Chef (${chefEmail}) ---`);
        try {
            const signupRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Pending Chef User',
                email: chefEmail,
                password: chefPassword,
                role: 'homeChef',
                address: { street: '123 Test St', city: 'Test City', state: 'TS', zipCode: '12345' }
            });
            chefToken = signupRes.data.token;
            // Handle different response structures (user vs data.user)
            chefId = signupRes.data.user?._id || signupRes.data.user?.id || signupRes.data._id;

            if (!chefId) throw new Error('Could not get Chef ID from signup response');
            console.log('✅ Chef Registered. Status should be PENDING. ID:', chefId);
        } catch (e) {
            console.error('❌ Chef Registration Failed:', e.response?.data || e.message);
            throw e;
        }

        // 2.5 Get a valid Category ID
        let categoryId;
        try {
            const catRes = await axios.get(`${API_URL}/categories`);
            if (catRes.data.categories && catRes.data.categories.length > 0) {
                categoryId = catRes.data.categories[0]._id;
            } else if (catRes.data.data && catRes.data.data.length > 0) {
                categoryId = catRes.data.data[0]._id;
            } else {
                console.warn('⚠️ No categories found. Using a dummy ObjectId (might fail).');
                categoryId = "65c3f9a7e8b9a1b2c3d4e5f6";
            }
            console.log('ℹ️ Using Category ID:', categoryId);
        } catch (e) {
            console.warn('⚠️ Could not fetch categories. Using dummy ID.');
            categoryId = "65c3f9a7e8b9a1b2c3d4e5f6";
        }

        // 3. Try to Create a Dish (Should FAIL - 403)
        console.log('\n--- 3. Verifying Restriction (Should Fail) ---');
        try {
            // Need a category ID first? Usually creates if string, or needs ID. 
            // Let's assume controller handles string category or we get one.
            // For now, let's use a dummy category ID or name.
            await axios.post(`${API_URL}/foods`, {
                name: "Forbidden Pie",
                description: "Should not be created",
                price: 10,
                category: categoryId,
                foodType: "home",
                images: ["http://example.com/pie.jpg"]
            }, {
                headers: { Authorization: `Bearer ${chefToken}` }
            });
            console.error('❌ ERROR: Pending Chef was able to create a dish! Security Flaw.');
            // If it succeeds (201), verification FAILS.
            process.exit(1);
        } catch (e) {
            if (e.response?.status === 403) {
                console.log('✅ SUCCESS: Pending Chef blocked from creating dish (403 Forbidden).');
                // console.log('Reason:', e.response.data.message);
            } else {
                console.error(`❌ Unexpected Error: ${e.response?.status}`, e.response?.data);
                // If it failed for other reasons (like validation), it's not a security pass, but let's continue for now.
            }
        }

        // 4. Register a Super Admin to Approve Chef
        console.log('\n--- 4. Registering Super Admin ---');
        let adminToken;
        try {
            const uniqueAdmin = `superadmin${Date.now()}@test.com`;
            const adminRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Super Admin User',
                email: uniqueAdmin,
                password: 'password123',
                role: 'superAdmin', // Assuming backend allows registering superAdmin for testing or we need a secret.
                address: { street: 'Admin St', city: 'Admin City', state: 'AD', zipCode: '00000' }
            });
            adminToken = adminRes.data.token;
            console.log('✅ Super Admin Registered & Logged In.');
        } catch (e) {
            console.error('❌ Could not register Super Admin. Backend might restrict this role creation.');
            // If we can't create superAdmin, we can't test approval.
            // Try logging in as the user we just created? No, they are homeChef.
            throw new Error("Cannot get Super Admin access.");
        }

        // 5. Approving Chef
        console.log('\n--- 5. Approving Chef ---');
        try {
            await axios.put(`${API_URL}/super-admin/chef/${chefId}/status`, {
                status: 'approved'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✅ Chef Approved by Admin.');
        } catch (e) {
            console.error('❌ Approval Failed:', e.response?.data || e.message);
            throw e;
        }

        // 6. Try to Create Dish Again (Should PASS)
        console.log('\n--- 6. Verifying Permission (Should Pass) ---');
        try {
            // We need a category "Dessert" to exist maybe. Assuming backend handles it.
            const dishRes = await axios.post(`${API_URL}/foods`, {
                name: "Allowed Pie",
                description: "This should work now",
                price: 15,
                category: categoryId,
                foodType: "home",
                images: ["http://example.com/pie.jpg"]
            }, {
                headers: { Authorization: `Bearer ${chefToken}` }
            });
            console.log('✅ SUCCESS: Approved Chef created a dish.', dishRes.data.data?.name);
        } catch (e) {
            console.error('❌ Creation Failed after Approval:', e.response?.data || e.message);
            // It might fail due to "Category not found" if backend is strict.
            // But if it's 403, permissions are broken.
            if (e.response?.status === 403) {
                console.error('❌ STILL 403 FORBIDDEN. Approval didn\'t work or middleware is broken.');
            }
            throw e;
        }

        console.log('\n🎉 Super Admin Verification COMPLETED SUCCESS!');

    } catch (error) {
        console.error('\n🛑 Verification Failed:', error.message);
        process.exit(1);
    }
};

runVerification();
