# Complete Order Flow Documentation

This document describes the complete order flow logic implemented in the food delivery platform, similar to Swiggy/Zomato.

## Order Status Flow

The order goes through the following statuses:

1. **PLACED** - Initial status when user places an order
2. **ACCEPTED** - Restaurant admin accepts the order (transitions immediately to PREPARING)
3. **REJECTED** - Restaurant admin rejects the order
4. **PREPARING** - Restaurant is preparing the order
5. **READY_FOR_PICKUP** - Order is ready for delivery partner to pick up
6. **OUT_FOR_DELIVERY** - Delivery partner has picked up and is delivering
7. **DELIVERED** - Order successfully delivered
8. **CANCELLED** - Order cancelled by user or admin

## Complete Order Flow

### 1. Order Placement (User Side)

**Endpoint:** `POST /api/orders`

**Flow:**
- User places order from cart
- Order created with:
  - `status = "PLACED"`
  - `deliveryPerson = null`
  - `paymentStatus` (pending/paid)
  - All order details (items, address, total)
- Cart is cleared
- Notification sent to:
  - Restaurant admin
  - User
- Real-time update emitted via Socket.IO

**Authorization:** User must be authenticated

---

### 2. Restaurant Admin Panel

**Restaurant admin sees ONLY orders for their restaurant.**

#### 2.1 Accept Order

**Endpoint:** `POST /api/restaurant-admin/orders/:id/accept`

**Flow:**
- Restaurant admin can accept orders with status `PLACED`
- Status changes: `PLACED` → `ACCEPTED` → `PREPARING` (automatic)
- Notification sent to user
- Real-time update emitted
- Order becomes visible in preparing queue

**Authorization:** Restaurant admin of the restaurant that owns the order

#### 2.2 Reject Order

**Endpoint:** `POST /api/restaurant-admin/orders/:id/reject`

**Flow:**
- Restaurant admin can reject orders with status `PLACED`
- Status changes: `PLACED` → `REJECTED`
- Notification sent to user with rejection message
- Real-time update emitted
- Order ends (terminal state)

**Authorization:** Restaurant admin of the restaurant that owns the order

#### 2.3 Mark Order as Ready for Pickup

**Endpoint:** `PUT /api/restaurant-admin/orders/:id/status`

**Body:** `{ "status": "READY_FOR_PICKUP" }`

**Flow:**
- Restaurant admin can update from `PREPARING` → `READY_FOR_PICKUP`
- Notification sent to user
- Order becomes available in delivery partner queue
- Real-time update emitted to all delivery partners
- Delivery partners can now see and accept this order

**Authorization:** Restaurant admin of the restaurant that owns the order

---

### 3. Delivery Partner Assignment

**Available Orders Endpoint:** `GET /api/delivery/orders/available`

**Flow:**
- Returns all orders with:
  - `status = "READY_FOR_PICKUP"`
  - `deliveryPerson = null`
- Only available delivery partners can see these orders
- Delivery partner criteria:
  - `role = "delivery"`
  - `status = "AVAILABLE"`
  - `active = true`
  - `isAvailable = true`

#### 3.1 Accept Order (Delivery Partner)

**Endpoint:** `POST /api/delivery/orders/:id/accept`

**Flow:**
- Delivery partner accepts order
- Order updates:
  - `deliveryPerson = deliveryGuyId`
  - `status = "OUT_FOR_DELIVERY"`
- Delivery partner updates:
  - `status = "BUSY"`
  - `isAvailable = false`
- Notifications sent to:
  - User
  - Restaurant admin
- Real-time updates emitted

**Authorization:** Delivery partner only

#### 3.2 Reject Order (Delivery Partner)

**Endpoint:** `POST /api/delivery/orders/:id/reject`

**Flow:**
- Delivery partner rejects order
- System attempts to find next available delivery partner
- If no available partners:
  - Notifications sent to:
    - Restaurant admin
    - Super admin (for manual assignment)
  - Order remains in queue

**Authorization:** Delivery partner only

---

### 4. Delivery Completion

**Endpoint:** `PUT /api/delivery/orders/:id/deliver`

**Flow:**
- Delivery partner marks order as delivered
- Order updates:
  - `status = "DELIVERED"`
- Delivery partner updates:
  - `status = "AVAILABLE"`
  - `isAvailable = true`
- Notifications sent to:
  - User
  - Restaurant admin
  - Super admin
- Real-time update emitted
- Order completed (terminal state)

**Authorization:** Delivery partner assigned to the order

---

### 5. Super Admin Capabilities

**Super Admin Endpoint:** `GET /api/orders/all`

**Capabilities:**
- View ALL orders from all restaurants
- Filter by status, restaurant, delivery person
- Track order lifecycle
- Monitor restaurant performance
- Monitor delivery partner activity
- Manually assign delivery partners (via update status endpoint)
- Cancel or resolve failed orders
- View all notifications

**Endpoints:**
- `GET /api/orders/all` - View all orders
- `PUT /api/orders/:id/status` - Manually update order status
- All admin routes

**Authorization:** Super admin or admin role

---

### 6. User Order Management

**User Endpoints:**
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order details
- `PUT /api/orders/:id/cancel` - Cancel order

**Cancellation Rules:**
- Cannot cancel if status is:
  - `DELIVERED`
  - `CANCELLED`
  - `OUT_FOR_DELIVERY`

**Flow:**
- Order status changes to `CANCELLED`
- If delivery person was assigned, mark them as `AVAILABLE`
- Notifications sent to restaurant admin
- Real-time update emitted

---

## Status Transition Validation

The system enforces valid status transitions based on role:

| Current Status | Role | Allowed Next Status |
|---------------|------|-------------------|
| PLACED | restaurant_admin | ACCEPTED, REJECTED |
| PLACED | admin/superAdmin | ACCEPTED, REJECTED, CANCELLED |
| ACCEPTED | restaurant_admin | PREPARING |
| PREPARING | restaurant_admin | READY_FOR_PICKUP |
| READY_FOR_PICKUP | delivery | OUT_FOR_DELIVERY |
| OUT_FOR_DELIVERY | delivery | DELIVERED |
| DELIVERED | - | (Terminal) |
| REJECTED | - | (Terminal) |
| CANCELLED | - | (Terminal) |

---

## Real-Time Updates (Socket.IO)

**Socket Events:**

- `new-order` - New order placed
- `order-updated` - Order status updated
- `order-accepted` - Order accepted by restaurant
- `order-rejected` - Order rejected by restaurant
- `order-assigned` - Order assigned to delivery partner
- `order-delivered` - Order delivered
- `order-cancelled` - Order cancelled
- `new-order-available` - New order available for delivery (delivery partners only)
- `new-notification` - New notification received

**Socket Rooms:**
- `user-{userId}` - User-specific room
- `restaurant-{restaurantId}` - Restaurant-specific room
- `delivery-partners` - All delivery partners
- `admin` - All admins and super admins

---

## Notification System

**Notification Types:**
- `order_placed` - Order placed
- `order_accepted` - Order accepted
- `order_rejected` - Order rejected
- `order_preparing` - Order being prepared
- `order_ready` - Order ready for pickup
- `order_out_for_delivery` - Order out for delivery
- `order_delivered` - Order delivered
- `order_cancelled` - Order cancelled
- `delivery_assigned` - Delivery partner assigned
- `general` - General notifications

**Notification Endpoints:**
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Delete all notifications

---

## API Examples

### Place Order
```json
POST /api/orders
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

### Accept Order (Restaurant Admin)
```json
POST /api/restaurant-admin/orders/:id/accept
```

### Reject Order (Restaurant Admin)
```json
POST /api/restaurant-admin/orders/:id/reject
{
  "reason": "Out of ingredients"
}
```

### Mark Ready for Pickup
```json
PUT /api/restaurant-admin/orders/:id/status
{
  "status": "READY_FOR_PICKUP"
}
```

### Accept Order (Delivery Partner)
```json
POST /api/delivery/orders/:id/accept
```

### Deliver Order
```json
PUT /api/delivery/orders/:id/deliver
```

### Cancel Order (User)
```json
PUT /api/orders/:id/cancel
{
  "reason": "Changed my mind"
}
```

---

## Database Models

### Order Model
```javascript
{
  user: ObjectId,
  items: [{
    food: ObjectId,
    name: String,
    quantity: Number,
    price: Number
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  totalAmount: Number,
  restaurant: ObjectId,
  deliveryPerson: ObjectId,
  status: Enum['PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  paymentMethod: String,
  paymentStatus: Enum['pending', 'paid', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

### User Model (Delivery Partner Fields)
```javascript
{
  role: Enum['user', 'admin', 'superAdmin', 'restaurant_admin', 'delivery'],
  restaurant: ObjectId, // For restaurant_admin
  status: Enum['AVAILABLE', 'BUSY'], // For delivery
  isAvailable: Boolean,
  active: Boolean
}
```

### Notification Model
```javascript
{
  user: ObjectId,
  order: ObjectId,
  title: String,
  message: String,
  type: Enum['order_placed', 'order_accepted', ...],
  isRead: Boolean,
  createdAt: Date
}
```

---

## Edge Cases Handled

1. **No Available Delivery Partners**
   - Order remains in `READY_FOR_PICKUP` status
   - Notifications sent to restaurant admin and super admin
   - Super admin can manually assign

2. **Multiple Delivery Partner Rejections**
   - System continues to try next available partner
   - Escalates to super admin if none available

3. **Order Cancellation During Delivery**
   - Only allowed if not `OUT_FOR_DELIVERY`
   - If delivery person assigned, they're marked as available

4. **Status Transition Validation**
   - Prevents invalid status changes
   - Role-based access control

5. **Real-Time Updates**
   - All relevant parties notified instantly
   - Socket.IO ensures no polling needed

---

## Security & Authorization

- JWT-based authentication for all endpoints
- Role-based access control (RBAC)
- Restaurant admins can only see their restaurant's orders
- Delivery partners can only accept unassigned orders
- Users can only view/cancel their own orders
- Super admin has full access

---

## Testing Checklist

- [ ] User can place order
- [ ] Restaurant admin sees only their orders
- [ ] Restaurant admin can accept/reject orders
- [ ] Order transitions through all statuses correctly
- [ ] Delivery partner can see available orders
- [ ] Delivery partner can accept/reject orders
- [ ] Order assignment works correctly
- [ ] Delivery completion updates all parties
- [ ] Notifications are created correctly
- [ ] Real-time updates work via Socket.IO
- [ ] Status transition validation works
- [ ] Edge cases handled properly

---

## Future Enhancements

- Automatic delivery partner assignment based on proximity
- Estimated delivery time calculation
- Order tracking with live location
- Rating and review system
- Order history and analytics
- Payment gateway integration
- Multi-restaurant orders support

