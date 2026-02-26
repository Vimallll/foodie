const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Earnings = require('../models/Earnings');
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

// Helper function to find next available delivery guy
const findNextAvailableDeliveryGuy = async () => {
  try {
    const availableDeliveryGuy = await User.findOne({
      role: 'delivery',
      availabilityStatus: 'ONLINE',
      isActive: true,
      isVerified: true,
    });

    return availableDeliveryGuy;
  } catch (error) {
    console.error('Error finding available delivery guy:', error);
    return null;
  }
};

// Helper function to calculate delivery fee
const calculateDeliveryFee = (distance, totalAmount = 0) => {
  // Base fee + per km charge + 5% of order amount
  const baseFee = 20; // Base delivery fee in currency units
  const perKmFee = 5; // Per kilometer charge
  const percentageFee = totalAmount * 0.05; // 5% of order value
  return Math.round(baseFee + (distance * perKmFee) + percentageFee);
};

// Helper function to calculate distance (placeholder - integrate with maps API)
const calculateDistance = (restaurantAddress, deliveryAddress) => {
  // In production, use Google Maps Distance Matrix API or similar
  // For now, return a random distance between 1-10 km
  return Math.floor(Math.random() * 10) + 1;
};

// Helper function to auto-cancel orders (DISABLED)
const autoCancelExpiredOrders = async () => {
  return 0; // Disabled
  /*
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes in milliseconds

    // Find orders that are READY_FOR_PICKUP, not assigned, and older than 10 minutes
    const expiredOrders = await Order.find({
      status: 'READY_FOR_PICKUP',
      deliveryPerson: null,
      createdAt: { $lte: tenMinutesAgo }
    }).populate('user', 'name email').populate('restaurant', 'name admin');

    if (expiredOrders.length > 0) {
      console.log(`Auto-cancelling ${expiredOrders.length} expired order(s)`);

      for (const order of expiredOrders) {
        // Cancel the order
        order.status = 'CANCELLED';
        order.updatedAt = Date.now();
        await order.save();

        // Create notifications
        await createNotification(
          order.user._id,
          order._id,
          'Order Cancelled',
          `Order #${order._id.toString().slice(-6)} was automatically cancelled as no delivery partner accepted it within 10 minutes.`,
          'order_cancelled'
        );

        if (order.restaurant && order.restaurant.admin) {
          await createNotification(
            order.restaurant.admin._id,
            order._id,
            'Order Auto-Cancelled',
            `Order #${order._id.toString().slice(-6)} was automatically cancelled as no delivery partner accepted it within 10 minutes.`,
            'order_cancelled'
          );
        }

        // Emit real-time update
        const updatedOrder = await Order.findById(order._id)
          .populate('user', 'name email phone')
          .populate('restaurant', 'name address phone admin')
          .populate('items.food');

        socketHelper.emitOrderUpdate(updatedOrder, 'order-cancelled');
      }
    }

    return expiredOrders.length;
  } catch (error) {
    console.error('Error auto-cancelling expired orders:', error);
    return 0;
  }
  */
};

// @desc    Get new order requests (available orders)
// @route   GET /api/delivery/orders/new
// @access  Private/Delivery
exports.getNewOrders = async (req, res) => {
  try {
    // Check if delivery partner is verified and online
    const deliveryPartner = await User.findById(req.user.id);

    if (!deliveryPartner.isVerified) {
      return res.status(403).json({
        message: 'Account not verified. Please wait for admin approval.',
      });
    }

    // Check availabilityStatus (or fallback to status)
    const currentStatus = deliveryPartner.availabilityStatus || deliveryPartner.status || 'OFFLINE';

    if (currentStatus !== 'ONLINE') {
      return res.status(400).json({
        message: `You must be ONLINE to receive new orders. Current status: ${currentStatus}`,
      });
    }

    // Auto-cancel expired orders (not accepted within 10 minutes)
    // Auto-cancel expired orders (disabled for testing manually)
    // await autoCancelExpiredOrders();

    // Get orders that are READY_FOR_PICKUP, not assigned to any delivery person, and created within last 24 hours
    const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    const orders = await Order.find({
      status: 'READY_FOR_PICKUP',
      deliveryPerson: null,
      createdAt: { $gt: timeWindow } // Orders created in the last 24 hours
    })
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('items.food')
      .sort({ createdAt: -1 });

    // Calculate distance and estimated earnings for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const distance = order.estimatedDistance || calculateDistance(
          order.restaurant.address,
          order.deliveryAddress
        );
        const deliveryFee = calculateDeliveryFee(distance, order.totalAmount);
        const estimatedEarnings = deliveryFee;

        return {
          ...order.toObject(),
          distance: distance,
          estimatedEarnings: estimatedEarnings,
          deliveryFee: deliveryFee,
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithDetails.length,
      data: ordersWithDetails,
    });
  } catch (error) {
    console.error('Get new orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery person's assigned orders
// @route   GET /api/delivery/orders
// @access  Private/Delivery
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPerson: req.user.id })
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
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

// @desc    Accept order (Delivery Guy)
// @route   POST /api/delivery/orders/:id/accept
// @access  Private/Delivery
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin')
      .populate('deliveryPerson', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is READY_FOR_PICKUP
    if (order.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({
        message: `Order is not ready for pickup. Current status: ${order.status}`
      });
    }

    // Check if order is already assigned
    if (order.deliveryPerson) {
      return res.status(400).json({ message: 'Order is already assigned to a delivery person' });
    }

    // Check if order has expired (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (order.createdAt < tenMinutesAgo) {
      // Auto-cancel the expired order
      order.status = 'CANCELLED';
      order.updatedAt = Date.now();
      await order.save();

      // Create notifications
      await createNotification(
        order.user._id,
        order._id,
        'Order Cancelled',
        `Order #${order._id.toString().slice(-6)} was automatically cancelled as no delivery partner accepted it within 10 minutes.`,
        'order_cancelled'
      );

      if (order.restaurant && order.restaurant.admin) {
        await createNotification(
          order.restaurant.admin._id,
          order._id,
          'Order Auto-Cancelled',
          `Order #${order._id.toString().slice(-6)} was automatically cancelled as no delivery partner accepted it within 10 minutes.`,
          'order_cancelled'
        );
      }

      return res.status(400).json({
        message: 'This order has expired and was automatically cancelled. It was not accepted within 10 minutes.'
      });
    }

    // Check if delivery person is verified and online
    const deliveryPartner = await User.findById(req.user.id);
    if (!deliveryPartner.isVerified) {
      return res.status(403).json({
        message: 'Account not verified. Please wait for admin approval.',
      });
    }

    if (deliveryPartner.availabilityStatus !== 'ONLINE') {
      return res.status(400).json({
        message: 'You must be ONLINE to accept orders'
      });
    }

    // Check if delivery partner already has an active order
    const activeOrder = await Order.findOne({
      deliveryPerson: req.user.id,
      status: { $in: ['PICKED_UP', 'ON_THE_WAY', 'OUT_FOR_DELIVERY'] }
    });

    if (activeOrder) {
      return res.status(400).json({
        message: 'You already have an active delivery. Complete it before accepting new orders.',
      });
    }

    // Assign order to delivery person
    order.deliveryPerson = req.user.id;
    order.status = 'OUT_FOR_DELIVERY';
    order.assignedToDeliveryAt = Date.now();
    order.updatedAt = Date.now();
    await order.save();

    // Update delivery person status to BUSY
    await User.findByIdAndUpdate(req.user.id, {
      availabilityStatus: 'BUSY',
      status: 'BUSY',
      isAvailable: false
    });

    // Create notifications
    await createNotification(
      order.user._id,
      order._id,
      'Order Out for Delivery',
      `Your order #${order._id.toString().slice(-6)} is out for delivery`,
      'order_out_for_delivery'
    );

    if (order.restaurant && order.restaurant.admin) {
      await createNotification(
        order.restaurant.admin._id,
        order._id,
        'Order Assigned',
        `Order #${order._id.toString().slice(-6)} has been assigned to a delivery person`,
        'delivery_assigned'
      );
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone admin')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-assigned');

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order accepted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject order (Delivery Guy)
// @route   POST /api/delivery/orders/:id/reject
// @access  Private/Delivery
exports.rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is READY_FOR_PICKUP
    if (order.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({
        message: `Cannot reject order with status ${order.status}`
      });
    }

    // Check if order is already assigned to someone else
    if (order.deliveryPerson && order.deliveryPerson.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'This order is assigned to another delivery person' });
    }

    // Try to find next available delivery guy
    const nextDeliveryGuy = await findNextAvailableDeliveryGuy();

    // Notify restaurant admin and super admin if no delivery guy available
    if (!nextDeliveryGuy) {
      // Notify restaurant admin
      if (order.restaurant && order.restaurant.admin) {
        await createNotification(
          order.restaurant.admin._id,
          order._id,
          'Delivery Partner Needed',
          `No available delivery partners for order #${order._id.toString().slice(-6)}. Order is pending assignment.`,
          'general'
        );
      }

      // Notify super admin (if exists)
      const superAdmins = await User.find({ role: 'superAdmin' });
      for (const admin of superAdmins) {
        await createNotification(
          admin._id,
          order._id,
          'Delivery Partner Needed',
          `Order #${order._id.toString().slice(-6)} needs manual delivery assignment. No available delivery partners.`,
          'general'
        );
      }
    }

    res.json({
      success: true,
      message: 'Order rejected. System will attempt to find another delivery partner.',
      orderAssignedToNext: nextDeliveryGuy ? true : false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status to delivered
// @route   PUT /api/delivery/orders/:id/deliver
// @access  Private/Delivery
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin')
      .populate('deliveryPerson', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is assigned to this delivery person
    if (!order.deliveryPerson || order.deliveryPerson._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to deliver this order' });
    }

    // Check if order is OUT_FOR_DELIVERY
    if (order.status !== 'OUT_FOR_DELIVERY') {
      return res.status(400).json({
        message: `Order is not out for delivery. Current status: ${order.status}`
      });
    }

    // Update order status to DELIVERED
    order.status = 'DELIVERED';
    order.deliveredAt = Date.now();
    order.updatedAt = Date.now();
    await order.save();

    // Calculate and save earnings
    const distance = order.estimatedDistance || calculateDistance(
      order.restaurant.address,
      order.deliveryAddress
    );
    const deliveryFee = order.deliveryFee || calculateDeliveryFee(distance, order.totalAmount);
    const tip = order.tip || 0;

    await Earnings.create({
      deliveryPartner: req.user.id,
      order: order._id,
      amount: deliveryFee + tip,
      distance: distance,
      deliveryFee: deliveryFee,
      tip: tip,
      status: 'pending',
    });

    // Update delivery person status back to ONLINE
    await User.findByIdAndUpdate(req.user.id, {
      availabilityStatus: 'ONLINE',
      status: 'ONLINE',
      isAvailable: true
    });

    // Create notifications
    await createNotification(
      order.user._id,
      order._id,
      'Order Delivered',
      `Your order #${order._id.toString().slice(-6)} has been delivered successfully!`,
      'order_delivered'
    );

    if (order.restaurant && order.restaurant.admin) {
      await createNotification(
        order.restaurant.admin._id,
        order._id,
        'Order Delivered',
        `Order #${order._id.toString().slice(-6)} has been delivered`,
        'order_delivered'
      );
    }

    // Notify super admin
    const superAdmins = await User.find({ role: 'superAdmin' });
    for (const admin of superAdmins) {
      await createNotification(
        admin._id,
        order._id,
        'Order Delivered',
        `Order #${order._id.toString().slice(-6)} has been delivered successfully`,
        'order_delivered'
      );
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone admin')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-delivered');

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order marked as delivered successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery person availability
// @route   PUT /api/delivery/availability
// @access  Private/Delivery
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable must be a boolean value' });
    }

    const user = await User.findById(req.user.id);

    // If setting to available, also set status to ONLINE for consistency
    if (isAvailable) {
      user.isAvailable = true;
      user.status = 'ONLINE';
      user.availabilityStatus = 'ONLINE';
    } else {
      // Only allow setting to unavailable if not currently delivering
      const activeDeliveries = await Order.countDocuments({
        deliveryPerson: req.user.id,
        status: 'OUT_FOR_DELIVERY'
      });

      if (activeDeliveries > 0) {
        return res.status(400).json({
          message: 'Cannot set unavailable while you have active deliveries'
        });
      }

      user.isAvailable = false;
      user.status = 'OFFLINE';
      user.availabilityStatus = 'OFFLINE';
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAvailable: user.isAvailable,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery person stats
// @route   GET /api/delivery/stats
// @access  Private/Delivery
exports.getStats = async (req, res) => {
  try {
    const [totalOrders, deliveredOrders, inProgressOrders, availableOrders] = await Promise.all([
      Order.countDocuments({ deliveryPerson: req.user.id }),
      Order.countDocuments({ deliveryPerson: req.user.id, status: 'DELIVERED' }),
      Order.countDocuments({
        deliveryPerson: req.user.id,
        status: 'OUT_FOR_DELIVERY'
      }),
      Order.countDocuments({
        status: 'READY_FOR_PICKUP',
        deliveryPerson: null
      }),
    ]);

    // Calculate total earnings from database instead of hardcoded estimate
    const earningsAgg = await Earnings.aggregate([
      { $match: { deliveryPartner: req.user.id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarnings = earningsAgg[0]?.total || 0;

    // Force fetch fresh user data to ensure status is up to date
    const freshUser = await User.findById(req.user.id);

    // Determine the correct status to return
    // Priority: 1. DB availabilityStatus, 2. DB status, 3. Default to 'ONLINE' (to avoid auto-offline issues)
    const currentStatus = freshUser.availabilityStatus || freshUser.status || 'ONLINE';

    res.json({
      success: true,
      stats: {
        totalOrders,
        deliveredOrders,
        inProgressOrders,
        availableOrders,
        totalEarnings,
        isAvailable: freshUser.isAvailable,
        status: currentStatus,
        availabilityStatus: currentStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update availability status
// @route   PATCH /api/delivery/status
// @access  Private/Delivery
exports.updateStatus = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (!['OFFLINE', 'ONLINE', 'BUSY'].includes(availabilityStatus)) {
      return res.status(400).json({
        message: 'availabilityStatus must be one of: OFFLINE, ONLINE, BUSY',
      });
    }

    const deliveryPartner = await User.findById(req.user.id);

    // Check if trying to go ONLINE but not verified
    if (availabilityStatus === 'ONLINE' && !deliveryPartner.isVerified) {
      console.warn('[updateStatus] Blocked: User not verified');
      return res.status(403).json({
        message: 'Cannot go ONLINE. Account is not verified. Please wait for admin approval.',
      });
    }

    // Cannot manually set to BUSY (only system does this when accepting order)
    if (availabilityStatus === 'BUSY') {
      return res.status(400).json({
        message: 'Cannot manually set status to BUSY. Status becomes BUSY automatically when you accept an order.',
      });
    }

    // Check if trying to go OFFLINE with active deliveries
    if (availabilityStatus === 'OFFLINE') {
      const activeDeliveries = await Order.countDocuments({
        deliveryPerson: req.user.id,
        status: { $in: ['PICKED_UP', 'ON_THE_WAY', 'OUT_FOR_DELIVERY'] }
      });

      if (activeDeliveries > 0) {
        console.warn('[updateStatus] Blocked: Active deliveries present');
        return res.status(400).json({
          message: 'Cannot go OFFLINE while you have active deliveries',
        });
      }
    }

    // Use findById first to get the document
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.availabilityStatus = availabilityStatus;
    user.status = availabilityStatus === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
    user.isAvailable = availabilityStatus === 'ONLINE';

    // Save to trigger any middleware and ensure persistence
    const updatedPartner = await user.save();

    if (!updatedPartner) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: `Status updated to ${availabilityStatus}`,
      data: {
        id: updatedPartner._id,
        availabilityStatus: updatedPartner.availabilityStatus,
        isAvailable: updatedPartner.isAvailable,
      },
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery person live location
// @route   POST /api/delivery/location
// @access  Private/Delivery
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        message: 'latitude and longitude must be valid numbers',
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: 'Invalid latitude or longitude values',
      });
    }

    const deliveryPartner = await User.findById(req.user.id);
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    deliveryPartner.currentLocation = {
      latitude,
      longitude,
      lastUpdated: Date.now(),
    };

    await deliveryPartner.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude,
        longitude,
        lastUpdated: deliveryPartner.currentLocation.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard data
// @route   GET /api/delivery/dashboard
// @access  Private/Delivery
exports.getDashboard = async (req, res) => {
  try {
    const deliveryPartner = await User.findById(req.user.id);

    // Get active order
    const activeOrder = await Order.findOne({
      deliveryPerson: req.user.id,
      status: { $in: ['PICKED_UP', 'ON_THE_WAY', 'OUT_FOR_DELIVERY'] }
    })
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone')
      .populate('items.food');

    // Get new order requests (if online)
    let newOrderRequests = [];
    if (deliveryPartner.availabilityStatus === 'ONLINE' && deliveryPartner.isVerified) {
      // Auto-cancel expired orders (disabled for testing manually)
      // await autoCancelExpiredOrders();

      // Get orders that are READY_FOR_PICKUP, not assigned, and created within last 24 hours
      const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
      const newOrders = await Order.find({
        status: 'READY_FOR_PICKUP',
        deliveryPerson: null,
        createdAt: { $gt: timeWindow }
      })
        .populate('user', 'name email phone')
        .populate('restaurant', 'name address phone')
        .limit(10)
        .sort({ createdAt: -1 });

      newOrderRequests = await Promise.all(
        newOrders.map(async (order) => {
          const distance = order.estimatedDistance || calculateDistance(
            order.restaurant.address,
            order.deliveryAddress
          );
          const deliveryFee = calculateDeliveryFee(distance, order.totalAmount);
          return {
            ...order.toObject(),
            distance,
            estimatedEarnings: deliveryFee,
            deliveryFee,
          };
        })
      );
    }

    // Get earnings summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalEarnings, todayEarnings, weeklyEarnings] = await Promise.all([
      Earnings.aggregate([
        { $match: { deliveryPartner: req.user.id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Earnings.aggregate([
        {
          $match: {
            deliveryPartner: req.user.id,
            createdAt: { $gte: today },
            status: { $ne: 'cancelled' }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Earnings.aggregate([
        {
          $match: {
            deliveryPartner: req.user.id,
            createdAt: { $gte: weekAgo },
            status: { $ne: 'cancelled' }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ]);

    // Get completed deliveries count
    const completedDeliveries = await Order.countDocuments({
      deliveryPerson: req.user.id,
      status: 'DELIVERED'
    });

    res.json({
      success: true,
      data: {
        profile: {
          id: deliveryPartner._id,
          fullName: deliveryPartner.fullName || deliveryPartner.name,
          phoneNumber: deliveryPartner.phoneNumber || deliveryPartner.phone,
          vehicleType: deliveryPartner.vehicleType,
          profilePhoto: deliveryPartner.profilePhoto,
          isVerified: deliveryPartner.isVerified,
          availabilityStatus: deliveryPartner.availabilityStatus,
        },
        activeOrder: activeOrder || null,
        newOrderRequests: newOrderRequests,
        earnings: {
          total: totalEarnings[0]?.total || 0,
          today: todayEarnings[0]?.total || 0,
          weekly: weeklyEarnings[0]?.total || 0,
        },
        stats: {
          completedDeliveries,
          totalOrders: await Order.countDocuments({ deliveryPerson: req.user.id }),
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (PICKED_UP, ON_THE_WAY, DELIVERED)
// @route   PATCH /api/delivery/orders/:id/status
// @access  Private/Delivery
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!['PICKED_UP', 'ON_THE_WAY', 'DELIVERED'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be one of: PICKED_UP, ON_THE_WAY, DELIVERED',
      });
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('restaurant', 'name admin')
      .populate('deliveryPerson', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is assigned to this delivery person
    if (!order.deliveryPerson || order.deliveryPerson._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to update this order',
      });
    }

    // Validate status transitions
    const validTransitions = {
      READY_FOR_PICKUP: ['PICKED_UP'],
      PICKED_UP: ['ON_THE_WAY'],
      ON_THE_WAY: ['DELIVERED'],
      OUT_FOR_DELIVERY: ['PICKED_UP', 'ON_THE_WAY', 'DELIVERED'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    // Update order status
    order.status = status;
    order.updatedAt = Date.now();

    if (status === 'PICKED_UP') {
      order.pickedUpAt = Date.now();
    }

    if (status === 'DELIVERED') {
      order.deliveredAt = Date.now();
      // Update delivery partner status back to available
      const deliveryPartner = await User.findById(req.user.id);
      if (deliveryPartner) {
        deliveryPartner.status = 'AVAILABLE';
        deliveryPartner.isAvailable = true;
        await deliveryPartner.save();
      }

      // Calculate and save earnings
      const distance = order.estimatedDistance || calculateDistance(
        order.restaurant.address,
        order.deliveryAddress
      );
      const deliveryFee = order.deliveryFee || calculateDeliveryFee(distance);
      const tip = order.tip || 0;

      await Earnings.create({
        deliveryPartner: req.user.id,
        order: order._id,
        amount: deliveryFee + tip,
        distance: distance,
        deliveryFee: deliveryFee,
        tip: tip,
        status: 'pending',
      });

      // Update delivery person status back to ONLINE
      await User.findByIdAndUpdate(req.user.id, {
        availabilityStatus: 'ONLINE',
        status: 'ONLINE',
        isAvailable: true,
      });
    }

    await order.save();

    // Create notifications
    let notificationTitle = 'Order Status Updated';
    let notificationMessage = `Order #${order._id.toString().slice(-6)} status updated to ${status}`;

    if (status === 'PICKED_UP') {
      notificationTitle = 'Order Picked Up';
      notificationMessage = `Your order #${order._id.toString().slice(-6)} has been picked up`;
    } else if (status === 'ON_THE_WAY') {
      notificationTitle = 'Order On The Way';
      notificationMessage = `Your order #${order._id.toString().slice(-6)} is on the way`;
    } else if (status === 'DELIVERED') {
      notificationTitle = 'Order Delivered';
      notificationMessage = `Your order #${order._id.toString().slice(-6)} has been delivered successfully!`;
    }

    await createNotification(
      order.user._id,
      order._id,
      notificationTitle,
      notificationMessage,
      `order_${status.toLowerCase()}`
    );

    if (order.restaurant && order.restaurant.admin) {
      await createNotification(
        order.restaurant.admin._id,
        order._id,
        `Order ${status}`,
        `Order #${order._id.toString().slice(-6)} is now ${status}`,
        `order_${status.toLowerCase()}`
      );
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address phone admin')
      .populate('deliveryPerson', 'name email phone')
      .populate('items.food');

    // Emit real-time update
    socketHelper.emitOrderUpdate(updatedOrder, 'order-updated');

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get earnings
// @route   GET /api/delivery/earnings
// @access  Private/Delivery
exports.getEarnings = async (req, res) => {
  try {
    const { period = 'all' } = req.query; // all, today, week, month

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchQuery = {
      deliveryPartner: req.user.id,
      status: { $ne: 'cancelled' },
    };

    if (period === 'today') {
      matchQuery.createdAt = { $gte: today };
    } else if (period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchQuery.createdAt = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchQuery.createdAt = { $gte: monthAgo };
    }

    const earnings = await Earnings.find(matchQuery)
      .populate('order', 'totalAmount status createdAt')
      .sort({ createdAt: -1 });

    const total = earnings.reduce((sum, earning) => sum + earning.amount, 0);

    res.json({
      success: true,
      data: {
        period,
        totalEarnings: total,
        earnings,
        count: earnings.length,
      },
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery history
// @route   GET /api/delivery/history
// @access  Private/Delivery
exports.getHistory = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const orders = await Order.find({
      deliveryPerson: req.user.id,
      status: 'DELIVERED',
    })
      .populate('user', 'name email phone')
      .populate('restaurant', 'name address')
      .populate('items.food')
      .sort({ deliveredAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get earnings for each order
    const ordersWithEarnings = await Promise.all(
      orders.map(async (order) => {
        const earning = await Earnings.findOne({
          order: order._id,
          deliveryPartner: req.user.id,
        });

        return {
          orderId: order._id,
          distance: order.estimatedDistance || 0,
          payout: earning ? earning.amount : 0,
          date: order.deliveredAt || order.updatedAt,
          status: order.status,
          order: order,
        };
      })
    );

    res.json({
      success: true,
      data: {
        orders: ordersWithEarnings,
        count: ordersWithEarnings.length,
        total: await Order.countDocuments({
          deliveryPerson: req.user.id,
          status: 'DELIVERED',
        }),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: error.message });
  }
};
