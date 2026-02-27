const axios = require('axios');

const API_URL = 'http://127.0.0.1:5001/api';

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let chefToken, customerToken;
let chefId, customerId;
let categoryId, restaurantId;
let chefDishId, restaurantDishId;

async function runVerification() {
    console.log('🚀 Starting Home Kitchen Verification...');

    try {
        // 0. Health Check
        try {
            const healthRes = await axios.get(`${API_URL}/health`);
            if (healthRes.headers['content-type'] && healthRes.headers['content-type'].includes('text/html')) {
                console.error('⚠️ Backend returned HTML. Content (first 500 chars):');
                console.error(healthRes.data.substring(0, 500));
                throw new Error('Backend returned HTML. Is the URL correct?');
            }
            console.log('✅ Backend Health Check:', healthRes.data);
        } catch (e) {
            console.error('❌ Backend Health Check Failed:', e.message);
            if (e.response && e.response.data) {
                if (typeof e.response.data === 'string') {
                    console.error('Response (first 500 chars):', e.response.data.substring(0, 500));
                } else {
                    console.error('Response:', JSON.stringify(e.response.data, null, 2));
                }
            }
            return;
        }

        // 1. Setup Prerequisites (Category & Restaurant)
        console.log('\nPlease ensure server is running...');
        console.log(`Targeting API: ${API_URL}`);

        let categories = [];
        try {
            console.log(`Fetching ${API_URL}/categories ...`);
            const categoriesRes = await axios.get(`${API_URL}/categories`, { headers: { 'Accept': 'application/json' } });
            categories = categoriesRes.data.categories || categoriesRes.data.data;
            if (!categories || categories.length === 0) throw new Error('No categories found.');
            categoryId = categories[0]._id;
            console.log(`✅ Found Category: ${categories[0].name} (${categoryId})`);
        } catch (e) {
            console.error('❌ Failed to fetch categories:', e.message);
            if (e.response) {
                console.error('Status:', e.response.status);
                if (typeof e.response.data === 'string') {
                    console.error('Response (first 500 chars):', e.response.data.substring(0, 500));
                }
            }
            throw e;
        }

        let restaurants = [];
        try {
            console.log(`Fetching ${API_URL}/restaurants ...`);
            const restaurantsRes = await axios.get(`${API_URL}/restaurants`, { headers: { 'Accept': 'application/json' } });
            restaurants = restaurantsRes.data.restaurants || restaurantsRes.data.data;
            if (!restaurants || restaurants.length === 0) throw new Error('No restaurants found.');
            restaurantId = restaurants[0]._id;
            console.log(`✅ Found Restaurant: ${restaurants[0].name} (${restaurantId})`);
        } catch (e) {
            console.error('❌ Failed to fetch restaurants:', e.message);
            if (e.response) console.error('Status:', e.response.status);
            throw e;
        }

        // Find a restaurant dish
        const restFoodRes = await axios.get(`${API_URL}/foods?restaurant=${restaurantId}`);
        const restFoods = restFoodRes.data.foods || restFoodRes.data.data;

        if (!restFoods || restFoods.length === 0) {
            console.log('⚠️ No restaurant food found. Skipping mixed order test part 2 if not fixed.');
        } else {
            restaurantDishId = restFoods[0]._id;
            console.log(`✅ Found Restaurant Dish: ${restFoods[0].name} (${restaurantDishId})`);
        }

        // 2. Register & Setup Home Chef
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
        chefToken = chefLogin.data.token;
        console.log('✅ Chef Logged In');

        // Upgrade to Chef
        console.log('🍳 Upgrading to Home Chef...');
        const chefRegisterRes = await axios.post(`${API_URL}/chefs/register`, {
            kitchenName: "Gordon's Test Kitchen",
            bio: "Best test food in town",
            specialties: ["Testing", "Debugging"],
            experience: "10 years",
            availability: { isAvailable: true, schedule: "24/7" }
        }, { headers: { 'Authorization': `Bearer ${chefToken}` } });

        chefId = chefRegisterRes.data.data._id;
        console.log(`✅ User Upgraded to Chef (${chefId})`);

        // Create Chef Dish
        console.log('🍛 Creating Home Kitchen Dish...');
        const dishRes = await axios.post(`${API_URL}/foods`, {
            name: "Grandma's Test Pie",
            description: "A very testing pie",
            price: 500,
            category: categoryId,
            foodType: 'home',
            preparationTime: 45,
            image: "https://via.placeholder.com/150"
        }, { headers: { 'Authorization': `Bearer ${chefToken}` } });

        chefDishId = dishRes.data.food._id;
        console.log(`✅ Dish Created: ${dishRes.data.food.name} (${chefDishId})`);

        // 3. Register Customer & Place Mixed Order
        const custEmail = `cust_${Date.now()}@test.com`;
        const custPassword = 'password123';

        console.log(`\n👤 Registering Customer: ${custEmail}`);
        await axios.post(`${API_URL}/auth/register`, {
            name: 'Hungry Tester',
            email: custEmail,
            password: custPassword
        });

        const custLogin = await axios.post(`${API_URL}/auth/login`, {
            email: custEmail,
            password: custPassword
        });
        customerToken = custLogin.data.token;
        console.log('✅ Customer Logged In');

        // Add Chef Dish to Cart
        console.log('🛒 Adding Chef Dish to Cart...');
        await axios.post(`${API_URL}/cart`, {
            foodId: chefDishId,
            quantity: 1
        }, { headers: { 'Authorization': `Bearer ${customerToken}` } });

        // Add Restaurant Dish to Cart (if exists)
        if (restaurantDishId) {
            console.log('🛒 Adding Restaurant Dish to Cart...');
            await axios.post(`${API_URL}/cart`, {
                foodId: restaurantDishId,
                quantity: 1
            }, { headers: { 'Authorization': `Bearer ${customerToken}` } });
        }

        // Place Order
        console.log('💳 Placing Order...');
        const orderRes = await axios.post(`${API_URL}/orders`, {
            deliveryAddress: {
                street: "123 Test St",
                city: "Testville",
                state: "TS",
                zipCode: "12345",
                country: "Testland"
            },
            paymentMethod: "cash"
        }, { headers: { 'Authorization': `Bearer ${customerToken}` } });

        if (restaurantDishId) {
            console.log(`\n📦 Order Result: ${orderRes.data.message}`);
            console.log(`Number of orders created: ${orderRes.data.count}`);

            if (orderRes.data.count === 2) {
                console.log('SUCCESS: ✅ Split Order Logic verified! Two orders created.');
                console.log('Order IDs:', orderRes.data.orders.map(o => o._id));
            } else {
                console.error(`FAILURE: ❌ Expected 2 orders, got ${orderRes.data.count || 1}`);
                console.log(JSON.stringify(orderRes.data, null, 2));
            }
        } else {
            console.log('Only home dish ordered (no restaurant dish found). Order created successfully.');
        }

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.response) {
            // console.error('Data:', JSON.stringify(error.response.data, null, 2)); // Already logged above
        }
    }
}

runVerification();
