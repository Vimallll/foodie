const mongoose = require('mongoose');
const Food = require('../models/Food');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
require('dotenv').config();

const restaurantsData = [
  {
    name: 'Pizza Palace',
    description: 'Authentic Italian pizzas with fresh ingredients and traditional recipes',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
    },
    phone: '+91-9876543210',
    rating: 4.5,
    deliveryTime: 25,
    cuisine: 'Italian',
  },
  {
    name: 'Burger House',
    description: 'Gourmet burgers made with premium beef and fresh ingredients',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
    address: {
      street: '456 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400052',
    },
    phone: '+91-9876543211',
    rating: 4.6,
    deliveryTime: 20,
    cuisine: 'American',
  },
  {
    name: 'Sushi Zen',
    description: 'Fresh Japanese sushi and sashimi prepared by expert chefs',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    address: {
      street: '789 Ocean Drive',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
    },
    phone: '+91-9876543212',
    rating: 4.7,
    deliveryTime: 30,
    cuisine: 'Japanese',
  },
  {
    name: 'Spice Garden',
    description: 'Authentic Indian cuisine with traditional spices and flavors',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    address: {
      street: '321 Curry Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400070',
    },
    phone: '+91-9876543213',
    rating: 4.8,
    deliveryTime: 35,
    cuisine: 'Indian',
  },
  {
    name: 'Taco Fiesta',
    description: 'Mexican street food with authentic flavors and fresh ingredients',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    address: {
      street: '654 Fiesta Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
    },
    phone: '+91-9876543214',
    rating: 4.4,
    deliveryTime: 25,
    cuisine: 'Mexican',
  },
  {
    name: 'Noodle Express',
    description: 'Quick and delicious Chinese noodles, dumplings, and stir-fries',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    address: {
      street: '987 Dragon Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400028',
    },
    phone: '+91-9876543215',
    rating: 4.3,
    deliveryTime: 20,
    cuisine: 'Chinese',
  },
  {
    name: 'Sweet Dreams Bakery',
    description: 'Artisan pastries, cakes, and desserts made fresh daily',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop',
    address: {
      street: '147 Sugar Lane',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110002',
    },
    phone: '+91-9876543216',
    rating: 4.6,
    deliveryTime: 15,
    cuisine: 'Desserts',
  },
  {
    name: 'Green Leaf Café',
    description: 'Healthy vegetarian and vegan options with organic ingredients',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    address: {
      street: '258 Health Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560002',
    },
    phone: '+91-9876543217',
    rating: 4.5,
    deliveryTime: 25,
    cuisine: 'Vegetarian',
  },
];

const foodsData = [
  // Pizza Palace Foods
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce',
    price: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 20,
    rating: 4.6,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Traditional pizza topped with spicy pepperoni and mozzarella cheese',
    price: 349,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 20,
    rating: 4.8,
  },
  {
    name: 'Supreme Pizza',
    description: 'Loaded with pepperoni, sausage, bell peppers, onions, and mushrooms',
    price: 449,
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 25,
    rating: 4.7,
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Grilled chicken, red onions, and BBQ sauce on a crispy crust',
    price: 399,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 22,
    rating: 4.5,
  },
  {
    name: 'Veggie Delight Pizza',
    description: 'Fresh vegetables including mushrooms, bell peppers, olives, and tomatoes',
    price: 329,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    categoryName: 'Pizza',
    restaurantName: 'Pizza Palace',
    preparationTime: 18,
    rating: 4.4,
  },

  // Burger House Foods
  {
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheese, fresh lettuce, tomato, and special sauce on a toasted bun',
    price: 199,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 15,
    rating: 4.5,
  },
  {
    name: 'BBQ Bacon Burger',
    description: 'Premium beef patty with crispy bacon, cheddar cheese, onion rings, and tangy BBQ sauce',
    price: 279,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 18,
    rating: 4.7,
  },
  {
    name: 'Chicken Burger',
    description: 'Crispy fried chicken breast with mayo, lettuce, and pickles on a soft bun',
    price: 219,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e788a531?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 12,
    rating: 4.4,
  },
  {
    name: 'Veggie Burger',
    description: 'Plant-based patty with fresh vegetables, avocado, and special sauce',
    price: 179,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 10,
    rating: 4.3,
  },
  {
    name: 'Double Cheese Burger',
    description: 'Two beef patties, double cheese, lettuce, tomato, and secret sauce',
    price: 299,
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&h=600&fit=crop',
    categoryName: 'Burgers',
    restaurantName: 'Burger House',
    preparationTime: 20,
    rating: 4.6,
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries served with ketchup',
    price: 99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 8,
    rating: 4.3,
  },
  {
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings served with blue cheese dip and celery sticks',
    price: 249,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&h=600&fit=crop',
    categoryName: 'Fast Food',
    restaurantName: 'Burger House',
    preparationTime: 15,
    rating: 4.6,
  },

  // Sushi Zen Foods
  {
    name: 'Salmon Sashimi',
    description: 'Fresh premium salmon slices served with soy sauce and wasabi',
    price: 599,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    categoryName: 'Sushi',
    restaurantName: 'Sushi Zen',
    preparationTime: 10,
    rating: 4.8,
  },
  {
    name: 'California Roll',
    description: 'Crab, avocado, cucumber wrapped in nori with sushi rice',
    price: 349,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    categoryName: 'Sushi',
    restaurantName: 'Sushi Zen',
    preparationTime: 12,
    rating: 4.6,
  },
  {
    name: 'Dragon Roll',
    description: 'Eel and cucumber topped with avocado and eel sauce',
    price: 449,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    categoryName: 'Sushi',
    restaurantName: 'Sushi Zen',
    preparationTime: 15,
    rating: 4.7,
  },
  {
    name: 'Tuna Nigiri',
    description: 'Fresh tuna on a bed of sushi rice',
    price: 399,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    categoryName: 'Sushi',
    restaurantName: 'Sushi Zen',
    preparationTime: 10,
    rating: 4.7,
  },
  {
    name: 'Miso Soup',
    description: 'Traditional Japanese soup with tofu, seaweed, and green onions',
    price: 149,
    image: 'https://images.unsplash.com/photo-1540660290370-8aa90e451e8a?w=800&h=600&fit=crop',
    categoryName: 'Sushi',
    restaurantName: 'Sushi Zen',
    preparationTime: 8,
    rating: 4.5,
  },

  // Spice Garden Foods
  {
    name: 'Butter Chicken',
    description: 'Tender chicken cooked in a rich, creamy tomato-based curry',
    price: 349,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    categoryName: 'Indian',
    restaurantName: 'Spice Garden',
    preparationTime: 30,
    rating: 4.8,
  },
  {
    name: 'Biryani',
    description: 'Fragrant basmati rice cooked with spices, herbs, and your choice of meat',
    price: 299,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop',
    categoryName: 'Indian',
    restaurantName: 'Spice Garden',
    preparationTime: 35,
    rating: 4.9,
  },
  {
    name: 'Paneer Tikka',
    description: 'Marinated cottage cheese grilled to perfection with spices',
    price: 249,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    categoryName: 'Indian',
    restaurantName: 'Spice Garden',
    preparationTime: 25,
    rating: 4.6,
  },
  {
    name: 'Dal Makhani',
    description: 'Creamy black lentils cooked with butter and spices',
    price: 199,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    categoryName: 'Indian',
    restaurantName: 'Spice Garden',
    preparationTime: 30,
    rating: 4.7,
  },
  {
    name: 'Naan Bread',
    description: 'Freshly baked traditional Indian flatbread',
    price: 79,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    categoryName: 'Indian',
    restaurantName: 'Spice Garden',
    preparationTime: 10,
    rating: 4.5,
  },
  {
    name: 'Chicken Curry',
    description: 'Spicy and flavorful chicken curry with aromatic spices',
    price: 279,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    categoryName: 'Indian',
    restaurantName: 'Spice Garden',
    preparationTime: 28,
    rating: 4.7,
  },

  // Taco Fiesta Foods
  {
    name: 'Beef Tacos',
    description: 'Seasoned ground beef with lettuce, cheese, and salsa in crispy shells',
    price: 249,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    categoryName: 'Mexican',
    restaurantName: 'Taco Fiesta',
    preparationTime: 15,
    rating: 4.5,
  },
  {
    name: 'Chicken Burrito',
    description: 'Grilled chicken, rice, beans, cheese, and salsa wrapped in a tortilla',
    price: 279,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
    categoryName: 'Mexican',
    restaurantName: 'Taco Fiesta',
    preparationTime: 18,
    rating: 4.6,
  },
  {
    name: 'Vegetable Quesadilla',
    description: 'Grilled tortilla filled with mixed vegetables and melted cheese',
    price: 199,
    image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=600&fit=crop',
    categoryName: 'Mexican',
    restaurantName: 'Taco Fiesta',
    preparationTime: 12,
    rating: 4.4,
  },
  {
    name: 'Guacamole & Chips',
    description: 'Fresh homemade guacamole served with crispy tortilla chips',
    price: 149,
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop',
    categoryName: 'Mexican',
    restaurantName: 'Taco Fiesta',
    preparationTime: 8,
    rating: 4.5,
  },

  // Noodle Express Foods
  {
    name: 'Chicken Chow Mein',
    description: 'Stir-fried noodles with chicken, vegetables, and savory sauce',
    price: 249,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    categoryName: 'Chinese',
    restaurantName: 'Noodle Express',
    preparationTime: 15,
    rating: 4.5,
  },
  {
    name: 'Vegetable Fried Rice',
    description: 'Wok-fried rice with mixed vegetables and eggs',
    price: 179,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    categoryName: 'Chinese',
    restaurantName: 'Noodle Express',
    preparationTime: 12,
    rating: 4.4,
  },
  {
    name: 'Dumplings (6 pcs)',
    description: 'Steamed dumplings filled with pork and vegetables, served with soy sauce',
    price: 199,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    categoryName: 'Chinese',
    restaurantName: 'Noodle Express',
    preparationTime: 10,
    rating: 4.6,
  },
  {
    name: 'Sweet and Sour Chicken',
    description: 'Crispy chicken pieces in tangy sweet and sour sauce',
    price: 279,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    categoryName: 'Chinese',
    restaurantName: 'Noodle Express',
    preparationTime: 18,
    rating: 4.5,
  },
  {
    name: 'Hot and Sour Soup',
    description: 'Spicy and tangy soup with vegetables and tofu',
    price: 129,
    image: 'https://images.unsplash.com/photo-1540660290370-8aa90e451e8a?w=800&h=600&fit=crop',
    categoryName: 'Chinese',
    restaurantName: 'Noodle Express',
    preparationTime: 10,
    rating: 4.3,
  },

  // Sweet Dreams Bakery Foods
  {
    name: 'Chocolate Cake Slice',
    description: 'Rich, moist chocolate cake with chocolate frosting',
    price: 149,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop',
    categoryName: 'Desserts',
    restaurantName: 'Sweet Dreams Bakery',
    preparationTime: 5,
    rating: 4.7,
  },
  {
    name: 'Cheesecake',
    description: 'Creamy New York-style cheesecake with berry compote',
    price: 199,
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&h=600&fit=crop',
    categoryName: 'Desserts',
    restaurantName: 'Sweet Dreams Bakery',
    preparationTime: 5,
    rating: 4.8,
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
    price: 229,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
    categoryName: 'Desserts',
    restaurantName: 'Sweet Dreams Bakery',
    preparationTime: 5,
    rating: 4.9,
  },
  {
    name: 'Apple Pie',
    description: 'Homemade apple pie with cinnamon and flaky crust',
    price: 179,
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&h=600&fit=crop',
    categoryName: 'Desserts',
    restaurantName: 'Sweet Dreams Bakery',
    preparationTime: 8,
    rating: 4.6,
  },
  {
    name: 'Chocolate Chip Cookies (6 pcs)',
    description: 'Freshly baked cookies with melty chocolate chips',
    price: 129,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop',
    categoryName: 'Desserts',
    restaurantName: 'Sweet Dreams Bakery',
    preparationTime: 5,
    rating: 4.5,
  },
  {
    name: 'Blueberry Muffin',
    description: 'Freshly baked muffin with juicy blueberries',
    price: 99,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&h=600&fit=crop',
    categoryName: 'Desserts',
    restaurantName: 'Sweet Dreams Bakery',
    preparationTime: 5,
    rating: 4.4,
  },

  // Green Leaf Café Foods
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 179,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
    categoryName: 'Salad',
    restaurantName: 'Green Leaf Café',
    preparationTime: 10,
    rating: 4.5,
  },
  {
    name: 'Greek Salad',
    description: 'Mixed greens with feta cheese, olives, tomatoes, and olive oil dressing',
    price: 199,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
    categoryName: 'Salad',
    restaurantName: 'Green Leaf Café',
    preparationTime: 10,
    rating: 4.6,
  },
  {
    name: 'Quinoa Bowl',
    description: 'Nutritious quinoa bowl with roasted vegetables and tahini dressing',
    price: 249,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    categoryName: 'Vegetarian',
    restaurantName: 'Green Leaf Café',
    preparationTime: 15,
    rating: 4.7,
  },
  {
    name: 'Veggie Wrap',
    description: 'Fresh vegetables, hummus, and sprouts wrapped in a whole wheat tortilla',
    price: 179,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
    categoryName: 'Vegetarian',
    restaurantName: 'Green Leaf Café',
    preparationTime: 8,
    rating: 4.5,
  },
  {
    name: 'Avocado Toast',
    description: 'Smashed avocado on artisan bread with cherry tomatoes and feta',
    price: 149,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
    categoryName: 'Breakfast',
    restaurantName: 'Green Leaf Café',
    preparationTime: 10,
    rating: 4.6,
  },
  {
    name: 'Fruit Smoothie Bowl',
    description: 'Blended fruits topped with granola, berries, and coconut flakes',
    price: 199,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop',
    categoryName: 'Breakfast',
    restaurantName: 'Green Leaf Café',
    preparationTime: 8,
    rating: 4.5,
  },
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...\n');

    // Create or get categories
    const categoryMap = {};
    const uniqueCategories = [...new Set(foodsData.map(item => item.categoryName))];
    
    console.log('--- Creating Categories ---\n');
    for (const categoryName of uniqueCategories) {
      try {
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
          category = await Category.create({
            name: categoryName,
            description: `Delicious ${categoryName.toLowerCase()} options`,
          });
          console.log(`✓ Created category: ${categoryName}`);
        } else {
          console.log(`→ Category already exists: ${categoryName}`);
        }
        categoryMap[categoryName] = category._id;
      } catch (error) {
        console.error(`❌ Error creating category ${categoryName}:`, error.message);
      }
    }

    console.log('\n--- Creating Restaurants ---\n');

    // Create or get restaurants
    const restaurantMap = {};
    for (const restaurantData of restaurantsData) {
      try {
        let restaurant = await Restaurant.findOne({ name: restaurantData.name });
        if (!restaurant) {
          restaurant = await Restaurant.create({
            name: restaurantData.name,
            description: restaurantData.description,
            image: restaurantData.image,
            address: restaurantData.address,
            phone: restaurantData.phone,
            rating: restaurantData.rating,
            deliveryTime: restaurantData.deliveryTime,
            isActive: true,
            cuisine: restaurantData.cuisine,
          });
          console.log(`✓ Created restaurant: ${restaurantData.name}`);
        } else {
          // Update existing restaurant with new data
          restaurant = await Restaurant.findByIdAndUpdate(
            restaurant._id,
            {
              description: restaurantData.description,
              image: restaurantData.image,
              address: restaurantData.address,
              phone: restaurantData.phone,
              rating: restaurantData.rating,
              deliveryTime: restaurantData.deliveryTime,
              cuisine: restaurantData.cuisine,
            },
            { new: true, runValidators: false }
          );
          console.log(`→ Updated restaurant: ${restaurantData.name}`);
        }
        restaurantMap[restaurantData.name] = restaurant._id;
      } catch (error) {
        console.error(`❌ Error creating restaurant ${restaurantData.name}:`, error.message);
      }
    }

    console.log('\n--- Adding Foods ---\n');

    // Validate that all restaurants and categories exist
    const missingRestaurants = [];
    const missingCategories = [];

    for (const item of foodsData) {
      if (!restaurantMap[item.restaurantName]) {
        if (!missingRestaurants.includes(item.restaurantName)) {
          missingRestaurants.push(item.restaurantName);
        }
      }
      if (!categoryMap[item.categoryName]) {
        if (!missingCategories.includes(item.categoryName)) {
          missingCategories.push(item.categoryName);
        }
      }
    }

    if (missingRestaurants.length > 0) {
      console.error(`❌ Error: Missing restaurants: ${missingRestaurants.join(', ')}`);
    }
    if (missingCategories.length > 0) {
      console.error(`❌ Error: Missing categories: ${missingCategories.join(', ')}`);
    }

    // Add foods
    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const item of foodsData) {
      try {
        // Validate restaurant and category exist
        if (!restaurantMap[item.restaurantName]) {
          console.error(`❌ Skipping ${item.name}: Restaurant '${item.restaurantName}' not found`);
          errorCount++;
          continue;
        }
        if (!categoryMap[item.categoryName]) {
          console.error(`❌ Skipping ${item.name}: Category '${item.categoryName}' not found`);
          errorCount++;
          continue;
        }

        const existingFood = await Food.findOne({ 
          name: item.name,
          restaurant: restaurantMap[item.restaurantName]
        });

        if (existingFood) {
          // Update existing food
          await Food.findByIdAndUpdate(existingFood._id, {
            description: item.description,
            price: item.price,
            image: item.image,
            category: categoryMap[item.categoryName],
            preparationTime: item.preparationTime,
            rating: item.rating,
            isAvailable: true,
          });
          console.log(`→ Updated: ${item.name} - ₹${item.price}`);
          updatedCount++;
        } else {
          // Create new food
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
          console.log(`✓ Added: ${item.name} - ₹${item.price}`);
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Error adding food ${item.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Categories: ${uniqueCategories.length}`);
    console.log(`Restaurants: ${restaurantsData.length}`);
    console.log(`Foods Added: ${addedCount}`);
    console.log(`Foods Updated: ${updatedCount}`);
    console.log(`Foods with Errors: ${errorCount}`);
    console.log(`Total Foods Processed: ${addedCount + updatedCount + errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n✅ Data seeding completed successfully!');
    } else {
      console.log(`\n⚠️  Data seeding completed with ${errorCount} errors. Please check the logs above.`);
    }

    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();

