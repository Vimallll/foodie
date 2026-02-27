const Food = require('../models/Food');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res) => {
  try {
    const { category, restaurant, chef, foodType, search, page = 1, limit = 10 } = req.query;

    const query = { isAvailable: true };

    if (category) {
      query.category = category;
    }
    if (restaurant) {
      query.restaurant = restaurant;
    }
    if (chef) {
      query.chef = chef;
    }
    if (foodType) {
      query.foodType = foodType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const foods = await Food.find(query)
      .populate('category', 'name')
      .populate('restaurant', 'name')
      .populate({
        path: 'chef',
        select: 'name chefProfile'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Food.countDocuments(query);

    res.json({
      success: true,
      count: foods.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      foods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
exports.getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('category', 'name')
      .populate('restaurant', 'name');

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({
      success: true,
      food,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create food
// @route   POST /api/foods
// @access  Private (Admin/Manager/HomeChef)
exports.createFood = async (req, res) => {
  try {
    const { name, description, price, category, restaurant, image, preparationTime, foodType } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Validation based on foodType
    if (foodType === 'home') {
      // For Home Kitchen, allow chef to add food
      // Ensure user is authorized (typically extracted from token)
      // If this endpoint is used by Home Chefs, req.user.id should be the chef field
      // We can also allow admin to pass 'chef' ID explicitly if needed

      const chefId = req.body.chef || req.user.id;

      // Verify user is a home chef
      const User = require('../models/User');
      const chefUser = await User.findById(chefId);

      if (!chefUser || chefUser.role !== 'homeChef') {
        return res.status(403).json({ message: 'User is not a Home Chef' });
      }

      const food = await Food.create({
        name,
        description,
        price,
        category,
        chef: chefId,
        foodType: 'home',
        image: image || '',
        preparationTime: preparationTime || 30, // Default slightly longer for home cooks
        isAvailable: true // Ensure default availability
      });

      const populatedFood = await Food.findById(food._id)
        .populate('category', 'name')
        .populate('chef', 'name chefProfile');

      return res.status(201).json({
        success: true,
        food: populatedFood,
      });

    } else {
      // Default Restaurant Flow
      const restaurantExists = await Restaurant.findById(restaurant);
      if (!restaurantExists) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      const food = await Food.create({
        name,
        description,
        price,
        category,
        restaurant,
        foodType: 'restaurant',
        image: image || '',
        preparationTime: preparationTime || 20,
      });

      const populatedFood = await Food.findById(food._id)
        .populate('category', 'name')
        .populate('restaurant', 'name');

      return res.status(201).json({
        success: true,
        food: populatedFood,
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFood = async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Ensure user is food owner (if Home Chef)
    if (req.user.role === 'homeChef' && food.chef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this food' });
    }

    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name').populate('restaurant', 'name');

    res.json({
      success: true,
      food,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete food
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Ensure user is food owner (if Home Chef)
    if (req.user.role === 'homeChef' && food.chef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this food' });
    }

    await food.deleteOne();

    res.json({
      success: true,
      message: 'Food deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

