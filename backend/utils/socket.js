// Socket.IO helper functions for emitting real-time events

let io = null;

// Initialize Socket.IO instance
exports.initializeSocket = (socketInstance) => {
  io = socketInstance;
};

// Emit order update to relevant users
exports.emitOrderUpdate = (order, eventType = 'order-updated') => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  try {
    // Emit to order owner (user)
    io.to(`user-${order.user._id || order.user}`).emit(eventType, {
      orderId: order._id,
      status: order.status,
      order: order,
    });

    // Emit to restaurant admin if restaurant exists
    if (order.restaurant && order.restaurant.admin) {
      io.to(`restaurant-${order.restaurant._id || order.restaurant}`).emit(eventType, {
        orderId: order._id,
        status: order.status,
        order: order,
      });
    }

    // Emit to delivery person if assigned
    if (order.deliveryPerson) {
      io.to(`user-${order.deliveryPerson._id || order.deliveryPerson}`).emit(eventType, {
        orderId: order._id,
        status: order.status,
        order: order,
      });
    }

    // Emit to all delivery partners if order is ready for pickup
    if (order.status === 'READY_FOR_PICKUP') {
      // Send order request to all online delivery partners
      io.to('delivery-partners').emit('new-order-request', {
        orderId: order._id,
        status: order.status,
        order: order,
        timestamp: new Date(),
      });
    }

    // Emit to admin/superAdmin
    io.to('admin').emit(eventType, {
      orderId: order._id,
      status: order.status,
      order: order,
    });

    console.log(`📡 Emitted ${eventType} for order ${order._id}`);
  } catch (error) {
    console.error('Error emitting socket event:', error);
  }
};

// Emit notification to user
exports.emitNotification = (userId, notification) => {
  if (!io) {
    console.warn('Socket.IO not initialized');
    return;
  }

  try {
    io.to(`user-${userId}`).emit('new-notification', notification);
    console.log(`📡 Emitted notification to user ${userId}`);
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
};

