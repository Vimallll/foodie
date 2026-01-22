const Food = require('../models/Food');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const User = require('../models/User');
const socketHelper = require('../utils/socket');

// Helper function to create notification
const createNotification = async (userId, orderId, title, message, type) => {
  try {
    await Notification.create({
      user: userId,
      order: orderId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Helper function to check if manager can access restaurant
const canAccessRestaurant = (user, restaurantId) => {
  // SuperAdmin can access all restaurants
  if (user.role === 'superAdmin') {
    return true;
  }
  // Manager can only access their assigned restaurant
  if (user.role === 'manager') {
    if (!user.restaurant) {
      console.error('Manager has no restaurant assigned:', user._id);
      return false;
    }
    const userRestaurantId = user.restaurant._id ? user.restaurant._id.toString() : user.restaurant.toString();
    const targetRestaurantId = restaurantId._id ? restaurantId._id.toString() : restaurantId.toString();
    const hasAccess = userRestaurantId === targetRestaurantId;
    if (!hasAccess) {
      console.error('Restaurant mismatch:', {
        userRestaurantId,
        targetRestaurantId,
        userRole: user.role
      });
    }
    return hasAccess;
  }
  return false;
};

// @desc    Get restaurant (SuperAdmin gets all, Manager gets their own)
// @route   GET /api/restaurant-admin/restaurant
// @route   GET /api/restaurant-admin/restaurant/:id (SuperAdmin only)
// @access  Private/Manager
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    
    // SuperAdmin can get any restaurant by ID or all restaurants
    if (req.user.role === 'superAdmin') {
      if (restaurantId) {
        const restaurant = await Restaurant.findById(restaurantId)
          .populate('admin', 'name email');
        
        if (!restaurant) {
          return res.status(404).json({ message: 'Restaurant not found' });
        }

        return res.json({
          success: true,
          restaurant,
        });
      }

      // Get all restaurants
      const restaurants = await Restaurant.find()
        .populate('admin', 'name email')
        .sort({ name: 1 });

      return res.json({
        success: true,
        count: restaurants.length,
        restaurants,
      });
    }

    // Manager gets their assigned restaurant only
    if (req.user.role === 'manager') {
      if (!req.user.restaurant) {
        return res.status(403).json({ message: 'No restaurant assigned to this manager' });
      }

      const restaurant = await Restaurant.findById(req.user.restaurant)
        .populate('admin', 'name email');

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      return res.json({
        success: true,
        restaurant,
      });
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get foods (SuperAdmin gets all, Manager gets their restaurant's foods)
// @route   GET /api/restaurant-admin/foods?restaurantId=xxx (SuperAdmin only)
// @access  Private/Manager
exports.getMyFoods = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'superAdmin') {
      // SuperAdmin can filter by restaurantId or get all
      const { restaurantId } = req.query;
      if (restaurantId) {
        query.restaurant = restaurantId;
      }
    } else if (req.user.role === 'manager') {
      // Manager only gets their restaurant's foods
      if (!req.user.restaurant) {
        return res.status(403).json({ message: 'No restaurant assigned to this manager' });
      }
      query.restaurant = req.user.restaurant;
    }

    const foods = await Food.find(query)
      .populate('category', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create food for restaurant
// @route   POST /api/restaurant-admin/foods
// @access  Private/Manager
exports.createFood = async (req, res) => {
  try {
    const { name, description, price, category, image, preparationTime, restaurant } = req.body;

    let restaurantId;

    if (req.user.role === 'superAdmin') {
      // SuperAdmin must provide restaurant ID
      if (!restaurant) {
        return res.status(400).json({ message: 'Restaurant ID is required' });
      }
      restaurantId = restaurant;
    } else if (req.user.role === 'manager') {
      // Manager uses their assigned restaurant
      if (!req.user.restaurant) {
        return res.status(403).json({ message: 'No restaurant assigned to this manager' });
      }
      restaurantId = req.user.restaurant;
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Verify restaurant exists
    const restaurantExists = await Restaurant.findById(restaurantId);
    if (!restaurantExists) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const food = await Food.create({
      name,
      description,
      price,
      category,
      restaurant: restaurantId,
      image: image || '',
      preparationTime: preparationTime || 20,
    });

    const populatedFood = await Food.findById(food._id)
      .populate('category', 'name')
      .populate('restaurant', 'name');

    res.status(201).json({
      success: true,
      food: populatedFood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food
// @route   PUT /api/restaurant-admin/foods/:id
// @access  Private/Manager
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Fetch user with restaurant populated to check authorization
    const user = await User.findById(req.user.id).populate('restaurant');
    
    // Check authorization
    const restaurantId = food.restaurant._id || food.restaurant;
    if (!canAccessRestaurant(user, restaurantId)) {
      return res.status(403).json({ message: 'Not authorized to update this food' });
    }

    const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name').populate('restaurant', 'name');

    res.json({
      success: true,
      food: updatedFood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete food
// @route   DELETE /api/restaurant-admin/foods/:id
// @access  Private/Manager
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Fetch user with restaurant populated to check authorization
    const user = await User.findById(req.user.id).populate('restaurant');
    
    // Check authorization
    const restaurantId = food.restaurant._id || food.restaurant;
    if (!canAccessRestaurant(user, restaurantId)) {
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

// @desc    Get orders (SuperAdmin gets all, Manager gets their restaurant's orders)
// @route   GET /api/restaurant-admin/orders?status=PLACED&restaurantId=xxx (SuperAdmin only)
// @access  Private/Manager
exports.getMyOrders = async (req, res) => {
  try {
    // Fetch user with restaurant populated
    const user = await User.findById(req.user.id).populate('restaurant');
    
    let query = {};

    if (user.role === 'superAdmin') {
      // SuperAdmin can filter by restaurantId or get all
      const { restaurantId, status } = req.query;
      if (restaurantId) {
        query.restaurant = restaurantId;
      }
      if (status) {
        query.status = status;
      }
    } else if (user.role === 'manager') {
      // Manager only gets their restaurant's orders
      if (!user.restaurant) {
        return res.status(403).json({ message: 'No restaurant assigned to this manager' });
      }
      const restaurantId = user.restaurant._id || user.restaurant;
      query.restaurant = restaurantId;
      const { status } = req.query;
      if (status) {
        query.status = status;
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('restaurant', 'name')
      .populate('items.food')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept order (SuperAdmin can accept any, Manager only their restaurant's orders)
// @route   POST /api/restaurant-admin/orders/:id/accept
// @access  Private/Manager
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch user with restaurant populated to check authorization
    const user = await User.findById(req.user.id).populate('restaurant');
    
    // Check authorization
    const restaurantId = order.restaurant._id || order.restaurant;
    if (!canAccessRestaurant(user, restaurantId)) {
      return res.status(403).json({ message: 'Not authorized to accept this order' });
    }

    // Check if order status is PLACED
    if (order.status !== 'PLACED') {
      return res.status(400).json({ 
        message: `Cannot accept order with status ${order.status}. Only PLACED orders can be accepted.` 
      });
    }

    // Update order status to ACCEPTED then PREPARING
    order.status = 'ACCEPTED';
    order.acceptedAt = Date.now();
    order.updatedAt = Date.now();
    await order.save();

    // Immediately move to PREPARING
    order.status = 'PREPARING';
    order.preparingAt = Date.now();
    await order.save();

    // Notify user
    await createNotification(
      order.user._id,
      order._id,
      'Order Accepted',
      `Your order #${order._id.toString().slice(-6)} has been accepted and is being prepared`,
      'order_accepted'
    );

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food')
      .populate('restaurant', 'name admin');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-accepted');

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order accepted and is now being prepared',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject order (SuperAdmin can reject any, Manager only their restaurant's orders)
// @route   POST /api/restaurant-admin/orders/:id/reject
// @access  Private/Manager
exports.rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch user with restaurant populated to check authorization
    const user = await User.findById(req.user.id).populate('restaurant');
    
    // Check authorization
    const restaurantId = order.restaurant._id || order.restaurant;
    if (!canAccessRestaurant(user, restaurantId)) {
      return res.status(403).json({ message: 'Not authorized to reject this order' });
    }

    // Check if order status is PLACED
    if (order.status !== 'PLACED') {
      return res.status(400).json({ 
        message: `Cannot reject order with status ${order.status}. Only PLACED orders can be rejected.` 
      });
    }

    // Update order status to REJECTED
    order.status = 'REJECTED';
    order.updatedAt = Date.now();
    await order.save();

    // Notify user with rejection message
    await createNotification(
      order.user._id,
      order._id,
      'Order Rejected',
      reason || `Your order #${order._id.toString().slice(-6)} has been rejected`,
      'order_rejected'
    );

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food')
      .populate('restaurant', 'name admin');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-rejected');

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order rejected',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (SuperAdmin/Manager can update from PREPARING to READY_FOR_PICKUP)
// @route   PUT /api/restaurant-admin/orders/:id/status
// @access  Private/Manager
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch user with restaurant populated to check authorization
    const user = await User.findById(req.user.id).populate('restaurant');
    
    // Check authorization
    const restaurantId = order.restaurant._id || order.restaurant;
    
    // Debug logging
    console.log('Update Order Status - Authorization Check:', {
      userId: user._id,
      userRole: user.role,
      userRestaurant: user.restaurant?._id || user.restaurant,
      userRestaurantString: user.restaurant?._id?.toString() || user.restaurant?.toString(),
      orderRestaurant: restaurantId,
      orderRestaurantString: restaurantId.toString(),
      restaurantMatch: user.restaurant && (user.restaurant._id?.toString() === restaurantId.toString() || user.restaurant.toString() === restaurantId.toString())
    });
    
    if (!canAccessRestaurant(user, restaurantId)) {
      console.error('Authorization failed:', {
        userId: user._id,
        userRole: user.role,
        userRestaurant: user.restaurant?._id || user.restaurant,
        orderRestaurant: restaurantId,
        restaurantMatch: user.restaurant && (user.restaurant._id?.toString() === restaurantId.toString() || user.restaurant.toString() === restaurantId.toString())
      });
      return res.status(403).json({ 
        message: 'Not authorized to update this order. Make sure you are assigned to the restaurant that owns this order.',
        debug: process.env.NODE_ENV === 'development' ? {
          userRole: user.role,
          userRestaurant: user.restaurant?._id || user.restaurant || 'NOT ASSIGNED',
          orderRestaurant: restaurantId
        } : undefined
      });
    }

    // Normalize status to uppercase for comparison
    const normalizedOrderStatus = order.status?.toUpperCase();
    const normalizedNewStatus = status?.toUpperCase();

    // Can only update from PREPARING to READY_FOR_PICKUP
    if (normalizedOrderStatus !== 'PREPARING' && normalizedNewStatus === 'READY_FOR_PICKUP') {
      return res.status(400).json({ 
        message: `Order must be in PREPARING status before marking as READY_FOR_PICKUP. Current status: ${order.status}` 
      });
    }

    if (status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({ 
        message: 'Can only update status to READY_FOR_PICKUP' 
      });
    }

    const oldStatus = order.status;
    // Normalize status to uppercase
    order.status = normalizedNewStatus;
    order.readyAt = Date.now();
    order.updatedAt = Date.now();
    await order.save();

    // Auto-assign delivery partner when order is ready (like Zomato/Swiggy)
    let autoAssignedDeliveryPartner = null;
    try {
      const User = require('../models/User');
      // Find nearest available delivery partner
      const availableDeliveryPartner = await User.findOne({
        role: 'delivery',
        availabilityStatus: 'ONLINE',
        isActive: true,
        isVerified: true,
        // Not currently assigned to any active order
        _id: {
          $nin: await Order.distinct('deliveryPerson', {
            status: { $in: ['PICKED_UP', 'ON_THE_WAY', 'OUT_FOR_DELIVERY'] }
          })
        }
      }).sort({ createdAt: 1 }); // Assign to oldest available partner (fair distribution)

      if (availableDeliveryPartner) {
        // Auto-assign the order
        order.deliveryPerson = availableDeliveryPartner._id;
        order.status = 'OUT_FOR_DELIVERY';
        order.assignedToDeliveryAt = Date.now();
        await order.save();

        // Update delivery partner status
        availableDeliveryPartner.status = 'BUSY';
        availableDeliveryPartner.isAvailable = false;
        await availableDeliveryPartner.save();

        autoAssignedDeliveryPartner = availableDeliveryPartner;

        // Notify delivery partner
        await createNotification(
          availableDeliveryPartner._id,
          order._id,
          'New Order Assigned',
          `Order #${order._id.toString().slice(-6)} has been assigned to you`,
          'order_assigned'
        );
      }
    } catch (error) {
      console.error('Error auto-assigning delivery partner:', error);
      // Continue even if auto-assignment fails - delivery partner can manually accept
    }

    // Notify user
    await createNotification(
      order.user._id,
      order._id,
      autoAssignedDeliveryPartner ? 'Order Out for Delivery' : 'Order Ready',
      autoAssignedDeliveryPartner 
        ? `Your order #${order._id.toString().slice(-6)} is out for delivery`
        : `Your order #${order._id.toString().slice(-6)} is ready for pickup`,
      autoAssignedDeliveryPartner ? 'order_out_for_delivery' : 'order_ready'
    );

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food')
      .populate('restaurant', 'name admin');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-updated');

    res.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated from ${oldStatus} to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stats (SuperAdmin gets all or filtered, Manager gets their restaurant's stats)
// @route   GET /api/restaurant-admin/stats?restaurantId=xxx (SuperAdmin only)
// @access  Private/Manager
exports.getStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'superAdmin') {
      // SuperAdmin can filter by restaurantId or get all
      const { restaurantId } = req.query;
      query = restaurantId ? { restaurant: restaurantId } : {};
    } else if (req.user.role === 'manager') {
      // Manager only gets their restaurant's stats
      if (!req.user.restaurant) {
        return res.status(403).json({ message: 'No restaurant assigned to this manager' });
      }
      query = { restaurant: req.user.restaurant };
    }

    const [totalFoods, totalOrders, placedOrders, acceptedOrders, preparingOrders, readyOrders, deliveredOrders] = await Promise.all([
      Food.countDocuments(query),
      Order.countDocuments(query),
      Order.countDocuments({ ...query, status: 'PLACED' }),
      Order.countDocuments({ ...query, status: 'ACCEPTED' }),
      Order.countDocuments({ ...query, status: 'PREPARING' }),
      Order.countDocuments({ ...query, status: 'READY_FOR_PICKUP' }),
      Order.countDocuments({ ...query, status: 'DELIVERED' }),
    ]);

    // Calculate total revenue
    const orders = await Order.find({ 
      ...query, 
      status: 'DELIVERED' 
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      success: true,
      stats: {
        totalFoods,
        totalOrders,
        placedOrders,
        acceptedOrders,
        preparingOrders,
        readyOrders,
        deliveredOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
