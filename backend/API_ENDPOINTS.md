# API Endpoints Reference

Complete list of all API endpoints for the food delivery platform order flow.

## Authentication Required

All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Order Endpoints

### 1. Place Order
**POST** `/api/orders`

**Access:** User

**Request Body:**
```json
{
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "cash"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order placed successfully"
}
```

---

### 2. Get User Orders
**GET** `/api/orders`

**Access:** User

**Response:**
```json
{
  "success": true,
  "count": 10,
  "orders": [ ... ]
}
```

---

### 3. Get Single Order
**GET** `/api/orders/:id`

**Access:** User (own orders), Restaurant Admin (restaurant orders), Delivery (assigned orders), Admin (all orders)

**Response:**
```json
{
  "success": true,
  "order": { ... }
}
```

---

### 4. Get All Orders (Super Admin)
**GET** `/api/orders/all`

**Query Parameters:**
- `status` - Filter by status
- `restaurant` - Filter by restaurant ID
- `deliveryPerson` - Filter by delivery person ID

**Access:** Admin, Super Admin

**Response:**
```json
{
  "success": true,
  "count": 50,
  "orders": [ ... ]
}
```

---

### 5. Update Order Status (Admin)
**PUT** `/api/orders/:id/status`

**Access:** Admin, Super Admin

**Request Body:**
```json
{
  "status": "DELIVERED",
  "reason": "Optional reason"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order status updated from OUT_FOR_DELIVERY to DELIVERED"
}
```

---

### 6. Cancel Order (User)
**PUT** `/api/orders/:id/cancel`

**Access:** User (own orders)

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order cancelled successfully"
}
```

---

## Restaurant Admin Endpoints

### 7. Get Restaurant Orders
**GET** `/api/restaurant-admin/orders`

**Query Parameters:**
- `status` - Filter by status

**Access:** Restaurant Admin

**Response:**
```json
{
  "success": true,
  "count": 15,
  "orders": [ ... ]
}
```

---

### 8. Accept Order
**POST** `/api/restaurant-admin/orders/:id/accept`

**Access:** Restaurant Admin (own restaurant orders)

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order accepted and is now being prepared"
}
```

---

### 9. Reject Order
**POST** `/api/restaurant-admin/orders/:id/reject`

**Access:** Restaurant Admin (own restaurant orders)

**Request Body:**
```json
{
  "reason": "Out of ingredients"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order rejected"
}
```

---

### 10. Update Order Status (Ready for Pickup)
**PUT** `/api/restaurant-admin/orders/:id/status`

**Access:** Restaurant Admin (own restaurant orders)

**Request Body:**
```json
{
  "status": "READY_FOR_PICKUP"
}
```

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order status updated from PREPARING to READY_FOR_PICKUP"
}
```

---

### 11. Get Restaurant Stats
**GET** `/api/restaurant-admin/stats`

**Access:** Restaurant Admin

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalFoods": 25,
    "totalOrders": 150,
    "placedOrders": 5,
    "acceptedOrders": 3,
    "preparingOrders": 8,
    "readyOrders": 2,
    "deliveredOrders": 132,
    "totalRevenue": 12500.50
  }
}
```

---

## Delivery Partner Endpoints

### 12. Get Available Orders
**GET** `/api/delivery/orders/available`

**Access:** Delivery Partner

**Response:**
```json
{
  "success": true,
  "count": 5,
  "orders": [ ... ]
}
```

---

### 13. Get My Orders
**GET** `/api/delivery/orders`

**Access:** Delivery Partner

**Response:**
```json
{
  "success": true,
  "count": 3,
  "orders": [ ... ]
}
```

---

### 14. Accept Order
**POST** `/api/delivery/orders/:id/accept`

**Access:** Delivery Partner

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order accepted successfully"
}
```

---

### 15. Reject Order
**POST** `/api/delivery/orders/:id/reject`

**Access:** Delivery Partner

**Response:**
```json
{
  "success": true,
  "message": "Order rejected. System will attempt to find another delivery partner.",
  "orderAssignedToNext": false
}
```

---

### 16. Deliver Order
**PUT** `/api/delivery/orders/:id/deliver`

**Access:** Delivery Partner (assigned orders)

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "message": "Order marked as delivered successfully"
}
```

---

### 17. Update Availability
**PUT** `/api/delivery/availability`

**Access:** Delivery Partner

**Request Body:**
```json
{
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "delivery",
    "isAvailable": true,
    "status": "AVAILABLE"
  }
}
```

---

### 18. Get Delivery Stats
**GET** `/api/delivery/stats`

**Access:** Delivery Partner

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 45,
    "deliveredOrders": 42,
    "inProgressOrders": 1,
    "availableOrders": 5,
    "totalEarnings": 84,
    "isAvailable": true,
    "status": "AVAILABLE"
  }
}
```

---

## Notification Endpoints

### 19. Get Notifications
**GET** `/api/notifications`

**Query Parameters:**
- `isRead` - Filter by read status (true/false)
- `limit` - Limit number of results

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "notifications": [ ... ]
}
```

---

### 20. Mark Notification as Read
**PUT** `/api/notifications/:id/read`

**Access:** Notification owner

**Response:**
```json
{
  "success": true,
  "notification": { ... }
}
```

---

### 21. Mark All Notifications as Read
**PUT** `/api/notifications/read-all`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 22. Delete Notification
**DELETE** `/api/notifications/:id`

**Access:** Notification owner

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### 23. Delete All Notifications
**DELETE** `/api/notifications`

**Access:** All authenticated users

**Response:**
```json
{
  "success": true,
  "message": "All notifications deleted"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error message here"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no token/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Socket.IO Events

### Client → Server Events

**Join Room:**
```javascript
socket.emit('join-room', {
  userId: '...',
  role: 'user',
  restaurantId: '...' // optional, for restaurant_admin
});
```

### Server → Client Events

**Order Events:**
- `new-order` - New order placed
- `order-updated` - Order status updated
- `order-accepted` - Order accepted by restaurant
- `order-rejected` - Order rejected by restaurant
- `order-assigned` - Order assigned to delivery partner
- `order-delivered` - Order delivered
- `order-cancelled` - Order cancelled
- `new-order-available` - New order available for delivery (delivery partners only)

**Notification Events:**
- `new-notification` - New notification received

---

## Order Status Values

- `PLACED` - Order just placed
- `ACCEPTED` - Order accepted (transitions to PREPARING immediately)
- `REJECTED` - Order rejected by restaurant
- `PREPARING` - Restaurant preparing order
- `READY_FOR_PICKUP` - Order ready for delivery partner
- `OUT_FOR_DELIVERY` - Order out for delivery
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

---

## Role-Based Access Summary

| Endpoint | User | Restaurant Admin | Delivery | Admin | Super Admin |
|----------|------|------------------|----------|-------|-------------|
| POST /api/orders | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /api/orders | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /api/orders/:id | ✅* | ✅* | ✅* | ✅ | ✅ |
| GET /api/orders/all | ❌ | ❌ | ❌ | ✅ | ✅ |
| PUT /api/orders/:id/status | ❌ | ❌ | ❌ | ✅ | ✅ |
| PUT /api/orders/:id/cancel | ✅* | ❌ | ❌ | ❌ | ❌ |
| GET /api/restaurant-admin/orders | ❌ | ✅ | ❌ | ❌ | ✅ |
| POST /api/restaurant-admin/orders/:id/accept | ❌ | ✅ | ❌ | ❌ | ✅ |
| POST /api/restaurant-admin/orders/:id/reject | ❌ | ✅ | ❌ | ❌ | ✅ |
| PUT /api/restaurant-admin/orders/:id/status | ❌ | ✅ | ❌ | ❌ | ✅ |
| GET /api/delivery/orders/available | ❌ | ❌ | ✅ | ❌ | ✅ |
| GET /api/delivery/orders | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /api/delivery/orders/:id/accept | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /api/delivery/orders/:id/reject | ❌ | ❌ | ✅ | ❌ | ✅ |
| PUT /api/delivery/orders/:id/deliver | ❌ | ❌ | ✅* | ❌ | ✅ |
| GET /api/notifications | ✅ | ✅ | ✅ | ✅ | ✅ |

* = Only for own/assigned resources

