const mongoose = require('mongoose');
const Category = require('../models/Category');
const dotenv = require('dotenv');

dotenv.config();

const addCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const newCategories = [
            { name: 'Gujarati', description: 'Authentic Gujarati Thali and snacks' },
            { name: 'Punjabi', description: 'Rich and spicy Punjabi curries' },
            { name: 'South Indian', description: 'Dosas, Idlis, and more' }
        ];

        for (const cat of newCategories) {
            const existing = await Category.findOne({ name: cat.name });
            if (existing) {
                console.log(`Category ${cat.name} already exists.`);
            } else {
                await Category.create(cat);
                console.log(`Added category: ${cat.name}`);
            }
        }

        console.log('Category addition complete.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addCategories();
