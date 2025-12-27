const mongoose = require('mongoose');
const Food = require('../models/Food');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

const fastFoodItems = [
  {
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheese, fresh lettuce, tomato, and special sauce on a toasted bun',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 15,
    rating: 4.5,
  },
  {
    name: 'BBQ Bacon Burger',
    description: 'Premium beef patty with crispy bacon, cheddar cheese, onion rings, and tangy BBQ sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 18,
    rating: 4.7,
  },
  {
    name: 'Chicken Burger',
    description: 'Crispy fried chicken breast with mayo, lettuce, and pickles on a soft bun',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e788a531?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 12,
    rating: 4.4,
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 20,
    rating: 4.6,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Traditional pizza topped with spicy pepperoni and mozzarella cheese',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 20,
    rating: 4.8,
  },
  {
    name: 'Supreme Pizza',
    description: 'Loaded with pepperoni, sausage, bell peppers, onions, and mushrooms',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 25,
    rating: 4.7,
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries served with ketchup',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 8,
    rating: 4.3,
  },
  {
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings served with blue cheese dip and celery sticks',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 15,
    rating: 4.6,
  },
  {
    name: 'Fish & Chips',
    description: 'Beer-battered fish with crispy fries and tartar sauce',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 18,
    rating: 4.5,
  },
  {
    name: 'Chicken Nuggets',
    description: 'Crispy breaded chicken nuggets served with your choice of dipping sauce',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 10,
    rating: 4.4,
  },
  {
    name: 'Onion Rings',
    description: 'Golden crispy onion rings with tangy dipping sauce',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 8,
    rating: 4.2,
  },
  {
    name: 'Hot Dog',
    description: 'Classic beef hot dog with mustard, ketchup, and relish',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 10,
    rating: 4.3,
  },
  {
    name: 'Chicken Tenders',
    description: 'Tender breaded chicken strips served with honey mustard and BBQ sauce',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 12,
    rating: 4.5,
  },
];

const addFastFood = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Create or get categories
    const categoryMap = {};
    for (const item of fastFoodItems) {
      if (!categoryMap[item.categoryName]) {
        let category = await Category.findOne({ name: item.categoryName });
        if (!category) {
          category = await Category.create({
            name: item.categoryName,
            description: `Delicious ${item.categoryName.toLowerCase()}`,
          });
          console.log(`Created category: ${item.categoryName}`);
        }
        categoryMap[item.categoryName] = category._id;
      }
    }

    // Create or get restaurants
    const restaurantMap = {};
    for (const item of fastFoodItems) {
      if (!restaurantMap[item.restaurantName]) {
        let restaurant = await Restaurant.findOne({ name: item.restaurantName });
        if (!restaurant) {
          restaurant = await Restaurant.create({
            name: item.restaurantName,
            description: `Best ${item.restaurantName.toLowerCase()} in town`,
            phone: '123-456-7890',
            deliveryTime: 25,
            isActive: true,
          });
          console.log(`Created restaurant: ${item.restaurantName}`);
        }
        restaurantMap[item.restaurantName] = restaurant._id;
      }
    }

    // Add fast food items
    let addedCount = 0;
    let skippedCount = 0;

    for (const item of fastFoodItems) {
      // Check if food already exists
      const existingFood = await Food.findOne({ name: item.name });
      if (existingFood) {
        console.log(`Skipped: ${item.name} (already exists)`);
        skippedCount++;
        continue;
      }

      const food = await Food.create({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: categoryMap[item.categoryName],
        restaurant: restaurantMap[item.restaurantName],
        preparationTime: item.preparationTime,
        rating: item.rating,
        isAvailable: true,
      });

      console.log(`✓ Added: ${item.name} - $${item.price}`);
      addedCount++;
    }

    console.log('\n=== Summary ===');
    console.log(`Added: ${addedCount} items`);
    console.log(`Skipped: ${skippedCount} items (already exist)`);
    console.log('Fast food items added successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error adding fast food:', error);
    process.exit(1);
  }
};

addFastFood();

