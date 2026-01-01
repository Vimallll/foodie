const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");

// Professional food delivery assistant chatbot (Swiggy/Zomato style)
const getChatbotResponse = async (userMessage) => {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Greetings - Friendly and welcoming
  if (
    lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste)/)
  ) {
    return "Hi there! 👋\n\nWelcome to Foodie! I'm here to help you find delicious food. What would you like to order today?\n\nYou can ask me about:\n• Popular dishes and restaurants\n• Food categories\n• Prices and delivery time\n• Adding items to cart\n• Placing orders";
  }

  // Help/What can you do
  if (
    lowerMessage.match(/^(help|support|what can you do|how can you help)/)
  ) {
    return "I'm your food delivery assistant! 😊\n\nI can help you:\n• Browse our menu and find dishes\n• Search restaurants and cuisines\n• Check prices and delivery times\n• Suggest popular items\n• Guide you to add items to cart\n• Help with checkout and ordering\n\nWhat would you like to explore?";
  }

  // Popular/Trending items
  if (
    lowerMessage.match(/(popular|trending|best|recommended|suggest|what.*good|top|favorite)/)
  ) {
    try {
      const popularFoods = await Food.find({ isAvailable: true })
        .sort({ rating: -1, createdAt: -1 })
        .limit(5)
        .populate("restaurant", "name")
        .select("name price rating restaurant");
      
      if (popularFoods.length > 0) {
        let response = "Here are some popular dishes right now! 🌟\n\n";
        popularFoods.forEach((food, index) => {
          response += `${index + 1}. ${food.name} - ₹${food.price}\n   ${food.restaurant.name} ⭐ ${food.rating.toFixed(1)}\n\n`;
        });
        response += "Would you like to add any of these to your cart?";
        return response;
      } else {
        return "We have many great options! Our bestsellers include pizzas, burgers, biryanis, and desserts. Would you like to browse a specific category?";
      }
    } catch (error) {
      return "We have amazing options like Margherita Pizza, Butter Chicken, Biryani, and more! Would you like me to suggest something specific?";
    }
  }

  // Search for specific food items
  if (
    lowerMessage.match(/(find|search|looking for|want|need|show me|i want)/)
  ) {
    try {
      // Extract potential food item names (simple pattern matching)
      const foodKeywords = lowerMessage.match(/\b(pizza|burger|biryani|pasta|sushi|chicken|rice|noodles|taco|curry|salad|dessert|sweet|ice cream|dosa|idli|soup|wings|fries|sandwich)\b/i);
      
      if (foodKeywords) {
        const searchTerm = foodKeywords[0];
        const foods = await Food.find({
          isAvailable: true,
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
          ],
        })
          .limit(5)
          .populate("restaurant", "name")
          .select("name price rating restaurant");
        
        if (foods.length > 0) {
          let response = `Great choice! Here's what I found for "${searchTerm}":\n\n`;
          foods.forEach((food, index) => {
            response += `${index + 1}. ${food.name} - ₹${food.price}\n   From ${food.restaurant.name} ⭐ ${food.rating.toFixed(1)}\n\n`;
          });
          response += "Would you like to know more about any of these?";
          return response;
        }
      }
      
      return "I'd be happy to help you find what you're looking for! 😊\n\nWhat type of food are you craving? For example:\n• Pizza\n• Burgers\n• Indian food\n• Chinese\n• Desserts\n\nOr tell me a specific dish name!";
    } catch (error) {
      return "I can help you search for food! What are you in the mood for? Try saying 'find pizza' or 'show me burgers'.";
    }
  }

  // Menu/Food categories
  if (
    lowerMessage.match(/(^|\s)(menu|food|items|dishes|categories|what.*available|what.*serve|cuisine)/
    )
  ) {
    try {
      const foodCount = await Food.countDocuments({ isAvailable: true });
      const categories = await Category.find().limit(8).select("name");
      const categoryNames = categories.map((c) => c.name).join(", ");
      
      return `We have ${foodCount} delicious dishes from amazing restaurants! 🍽️\n\nOur categories include:\n${categoryNames}\n\nWhich cuisine are you craving? I can show you specific dishes!`;
    } catch (error) {
      return "We have a wide variety including pizzas, burgers, Indian, Chinese, Mexican, sushi, and desserts! What sounds good to you?";
    }
  }

  // Restaurant queries
  if (
    lowerMessage.match(/(^|\s)(restaurant|restaurants|which.*serve|where.*from|from where)/
    )
  ) {
    try {
      const restaurantCount = await Restaurant.countDocuments({ isActive: true });
      const restaurants = await Restaurant.find({ isActive: true })
        .limit(6)
        .select("name rating deliveryTime");
      const restaurantNames = restaurants.map((r) => 
        `${r.name} (${r.deliveryTime} min) ⭐ ${r.rating.toFixed(1)}`
      ).join("\n");
      
      return `We have ${restaurantCount} amazing restaurants! 🏪\n\nHere are some popular ones:\n${restaurantNames}\n\nWhich restaurant would you like to order from?`;
    } catch (error) {
      return "We partner with great restaurants like Pizza Palace, Burger House, Sushi Zen, Spice Garden, and more! Which cuisine are you in the mood for?";
    }
  }

  // Price/Budget queries
  if (lowerMessage.match(/(price|cost|expensive|cheap|budget|how much|pricing|affordable)/)) {
    try {
      const priceRange = await Food.aggregate([
        { $match: { isAvailable: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            avgPrice: { $avg: "$price" },
          },
        },
      ]);
      
      if (priceRange.length > 0) {
        const { minPrice, maxPrice, avgPrice } = priceRange[0];
        return `Our prices are very reasonable! 💰\n\n• Starting from: ₹${Math.round(minPrice)}\n• Up to: ₹${Math.round(maxPrice)}\n• Average: ₹${Math.round(avgPrice)}\n\nWhat's your budget? I can suggest dishes in your price range!`;
      }
      return "Our prices range from ₹79 to ₹599. Most dishes are between ₹150-₹350. What's your budget? I can suggest the perfect dish! 💰";
    } catch (error) {
      return "Our prices are wallet-friendly! Most items are between ₹150-₹350. What's your budget range? I can help you find something perfect!";
    }
  }

  // Delivery time queries
  if (
    lowerMessage.match(
      /(delivery|deliver|delivery time|how long|when.*arrive|time.*take|fast|quick)/
    )
  ) {
    try {
      const avgDelivery = await Restaurant.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgTime: { $avg: "$deliveryTime" } } },
      ]);
      
      const avgTime = avgDelivery.length > 0 ? Math.round(avgDelivery[0].avgTime) : 25;
      return `We deliver super fast! ⚡\n\n• Average delivery: ${avgTime} minutes\n• Range: 15-35 minutes\n• Depends on restaurant and your location\n\nMost orders arrive within 30 minutes! Want to place an order?`;
    } catch (error) {
      return "We deliver super fast! Usually 15-35 minutes depending on your location and the restaurant. Most orders arrive within 30 minutes! 🚀\n\nReady to order?";
    }
  }

  // Cart-related queries
  if (lowerMessage.match(/(cart|add.*cart|remove|delete.*cart|empty.*cart|clear.*cart|items.*cart)/)) {
    return "To manage your cart:\n\n1️⃣ **Add items**: Click 'Add to Cart' on any dish\n2️⃣ **View cart**: Click the cart icon in the header\n3️⃣ **Remove items**: Go to cart and click remove\n4️⃣ **Update quantity**: Change quantity in the cart page\n\nOnce you're ready, click 'Checkout' to place your order! 🛒\n\nNeed help finding something to add?";
  }

  // Order/Checkout queries
  if (lowerMessage.match(/(order|place order|buy|purchase|checkout|how.*order|how.*buy)/)) {
    return "Placing an order is super easy! 😊\n\nHere's how:\n\n1️⃣ Browse our menu and find dishes you like\n2️⃣ Click 'Add to Cart' for each item\n3️⃣ Click the cart icon 🛒 to review your order\n4️⃣ Click 'Checkout' when ready\n5️⃣ Enter your delivery address\n6️⃣ Choose payment method\n7️⃣ Confirm your order!\n\nThat's it! Your food will be on its way. 🚀\n\nWould you like help finding something to add to your cart?";
  }

  // Payment queries
  if (lowerMessage.match(/(payment|pay|card|cash|how.*pay|payment.*method|upi|wallet)/)) {
    return "We accept multiple payment options! 💳\n\n• Cash on Delivery (COD)\n• Credit/Debit Cards\n• UPI\n• Digital Wallets\n\nYou can choose your preferred method during checkout. All payments are secure!\n\nReady to place an order?";
  }

  // Vegetarian queries
  if (lowerMessage.match(/(vegetarian|veg|vegan|plant-based|no meat|only veg)/)) {
    try {
      const vegCategories = await Category.find({
        name: { $regex: /vegetarian|veg|salad/i },
      }).select("name");
      
      return "Absolutely! We have amazing vegetarian options! 🥗\n\n• Green Leaf Café (dedicated vegetarian restaurant)\n• Many vegetarian dishes across all restaurants\n• Look for the 🟢 veg indicator on dishes\n• We have salads, vegetarian pizzas, veg burgers, and more!\n\nWould you like me to suggest some vegetarian dishes?";
    } catch (error) {
      return "Yes! We have lots of vegetarian options! Check out Green Leaf Café or browse our menu - look for the green veg indicator on dishes. What type of vegetarian food are you craving?";
    }
  }

  // Availability queries
  if (lowerMessage.match(/(available|in stock|out of stock|have|do you have)/)) {
    try {
      const availableCount = await Food.countDocuments({ isAvailable: true });
      return `Yes! We have ${availableCount} dishes available right now! 😊\n\nAll items showing on our menu are in stock and ready to order. If something is unavailable, it won't appear on the menu.\n\nWhat would you like to order?`;
    } catch (error) {
      return "Yes, all items on our menu are available! 😊 What would you like to order?";
    }
  }

  // Location/Address queries
  if (lowerMessage.match(/(location|address|where|area|city|deliver.*where|coverage)/)) {
    return "We deliver to multiple cities! 📍\n\n• Mumbai\n• Delhi\n• Bangalore\n• And more areas!\n\nYou can select your location on the homepage. Just enter your delivery address during checkout and we'll confirm if we deliver to your area.\n\nWhat's your location? I can help you check availability!";
  }

  // Hours/Time queries
  if (lowerMessage.match(/(hours|open|closed|when.*open|operating.*hours|timing)/)) {
    return "Most restaurants are open: ⏰\n\n• Morning: 10:00 AM onwards\n• Evening: Till 11:00 PM\n• Some restaurants may vary\n\nYou can place orders during these hours. Check individual restaurant pages for specific timings.\n\nWhat time would you like to order?";
  }

  // Complaints/Issues - Handle calmly
  if (lowerMessage.match(/(problem|issue|wrong|bad|complaint|not working|error|help.*issue)/)) {
    return "I'm sorry to hear you're facing an issue. 😔\n\nLet me help you:\n\n• If it's about your order, please share your order number\n• For payment issues, contact support\n• For food quality concerns, we take this seriously\n\nCan you tell me more about the problem? I'll guide you to the right solution.\n\nOr you can contact our support team for immediate assistance.";
  }

  // Confusion - Step by step guidance
  if (lowerMessage.match(/(confused|don't know|help me|guide|what.*do|how.*start|new here)/)) {
    return "No worries! I'll help you step by step. 😊\n\nLet's start:\n\n1️⃣ **First**, tell me what you're craving (pizza, Indian, Chinese, etc.)\n2️⃣ I'll suggest some dishes\n3️⃣ You can browse and add items to cart\n4️⃣ When ready, checkout and place your order\n\nWhat type of food are you in the mood for? Just tell me and I'll guide you!";
  }

  // Thank you
  if (lowerMessage.match(/(thank|thanks|appreciate|grateful|thank you)/)) {
    return "You're very welcome! 😊\n\nHappy to help! If you need anything else, just ask. Enjoy your meal! 🍽️";
  }

  // Goodbye
  if (lowerMessage.match(/(bye|goodbye|see you|farewell|talk.*later)/)) {
    return "Goodbye! 👋\n\nHope you enjoy your food! Come back anytime you need help. Have a great day! 😊";
  }

  // Food-specific queries (pizza, burger, etc.)
  const foodTypes = [
    { pattern: /pizza/, name: "Pizza", emoji: "🍕" },
    { pattern: /burger/, name: "Burgers", emoji: "🍔" },
    { pattern: /biryani|rice/, name: "Biryani", emoji: "🍛" },
    { pattern: /chinese|noodles|chow mein/, name: "Chinese", emoji: "🥟" },
    { pattern: /indian|curry|tikka/, name: "Indian", emoji: "🍛" },
    { pattern: /sushi/, name: "Sushi", emoji: "🍣" },
    { pattern: /mexican|taco|burrito/, name: "Mexican", emoji: "🌮" },
    { pattern: /dessert|sweet|cake/, name: "Desserts", emoji: "🍰" },
    { pattern: /salad/, name: "Salads", emoji: "🥗" },
  ];

  for (const foodType of foodTypes) {
    if (foodType.pattern.test(lowerMessage)) {
      try {
        const foods = await Food.find({
          isAvailable: true,
          $or: [
            { name: { $regex: foodType.pattern, $options: "i" } },
            { description: { $regex: foodType.pattern, $options: "i" } },
          ],
        })
          .limit(5)
          .populate("restaurant", "name")
          .select("name price rating restaurant");
        
        if (foods.length > 0) {
          let response = `Great choice! ${foodType.emoji} Here are some ${foodType.name} options:\n\n`;
          foods.forEach((food, index) => {
            response += `${index + 1}. ${food.name} - ₹${food.price}\n   ${food.restaurant.name} ⭐ ${food.rating.toFixed(1)}\n\n`;
          });
          response += "Would you like to add any of these to your cart?";
          return response;
        }
      } catch (error) {
        // Fall through to default
      }
      return `We have amazing ${foodType.name} options! ${foodType.emoji}\n\nBrowse our ${foodType.name} section to see all available dishes. Would you like me to suggest something specific?`;
    }
  }

  // Default response - Friendly and helpful
  return "I'm here to help you order delicious food! 😊\n\nYou can ask me:\n• 'Show me popular dishes'\n• 'Find pizza' or any food\n• 'What restaurants do you have?'\n• 'What's the delivery time?'\n• 'How do I place an order?'\n\nWhat would you like to know?";
};

exports.chatReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        reply: "Hi! Please type a message so I can help you. 😊" 
      });
    }

    const reply = await getChatbotResponse(message.trim());

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({
      reply: "Oops! I'm having a little trouble right now. 😔\n\nPlease try again in a moment, or contact our support team for immediate help. Sorry for the inconvenience!",
    });
  }
};
