# Restaurant Manager Role Setup

## Overview

A new role `restaurant_manager` has been added that can manage **ALL restaurants** in the system, unlike `restaurant_admin` which can only manage a single assigned restaurant.

## Roles Comparison

### Restaurant Admin (`restaurant_admin`)
- Manages **one specific restaurant** assigned to them
- Access is limited to their assigned restaurant's:
  - Foods
  - Orders
  - Stats
- Cannot access other restaurants' data

### Restaurant Manager (`restaurant_manager`)
- Manages **ALL restaurants** in the system
- Can access all restaurants':
  - Foods
  - Orders
  - Stats
- Can filter by restaurant ID when needed
- Full management capabilities across all restaurants

## Creating a Manager Account

### Using Script (Recommended)

```bash
cd backend
npm run create-manager [name] [email] [password]
```

**Example:**
```bash
npm run create-manager "John Manager" "manager@foodie.com" "securepassword123"
```

**Default values:**
- Name: "Manager"
- Email: "manager@foodie.com"
- Password: "manager123"

### Manual Creation

You can also create a manager account via:
1. Registration API (then update role in database)
2. Direct database insertion
3. Admin panel (if available)

**MongoDB Command:**
```javascript
db.users.insertOne({
  name: "Manager Name",
  email: "manager@foodie.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash
  role: "restaurant_manager",
  createdAt: new Date()
})
```

## API Usage

### Endpoints Accessible to Manager

All `/api/restaurant-admin/*` endpoints are accessible to both `restaurant_manager` and `restaurant_admin`:

#### Get Restaurants
```
GET /api/restaurant-admin/restaurant
```
- **Manager**: Returns all restaurants
- **Restaurant Admin**: Returns their assigned restaurant

```
GET /api/restaurant-admin/restaurant/:id
```
- **Manager only**: Get specific restaurant by ID

#### Get Foods
```
GET /api/restaurant-admin/foods?restaurantId=xxx
```
- **Manager**: Can filter by `restaurantId` or get all foods from all restaurants
- **Restaurant Admin**: Gets foods from their restaurant only

#### Get Orders
```
GET /api/restaurant-admin/orders?restaurantId=xxx&status=PLACED
```
- **Manager**: Can filter by `restaurantId` or get all orders from all restaurants
- **Restaurant Admin**: Gets orders from their restaurant only

#### Get Stats
```
GET /api/restaurant-admin/stats?restaurantId=xxx
```
- **Manager**: Can filter by `restaurantId` or get aggregated stats from all restaurants
- **Restaurant Admin**: Gets stats from their restaurant only

#### Create Food
```
POST /api/restaurant-admin/foods
{
  "name": "Food Name",
  "price": 100,
  "category": "categoryId",
  "restaurant": "restaurantId" // Required for manager
}
```
- **Manager**: Must provide `restaurant` field
- **Restaurant Admin**: Uses their assigned restaurant automatically

#### Accept/Reject Orders
```
POST /api/restaurant-admin/orders/:id/accept
POST /api/restaurant-admin/orders/:id/reject
```
- **Manager**: Can accept/reject orders from any restaurant
- **Restaurant Admin**: Can only accept/reject orders from their restaurant

## Authorization Logic

The system uses a helper function `canAccessRestaurant(user, restaurantId)` that:
- Returns `true` for managers (can access all restaurants)
- Returns `true` for restaurant admins only if `restaurantId` matches their assigned restaurant
- Returns `false` otherwise

## Middleware

### `restaurantManager` Middleware
- Allows: `restaurant_manager`, `restaurant_admin`, `admin`, `superAdmin`
- Used for endpoints that support both manager and restaurant admin access

### `restaurantAdmin` Middleware
- Allows: `restaurant_admin`, `admin`
- Used for endpoints specific to single restaurant admins

## Database Schema

The User model now includes:
```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'superAdmin', 'restaurant_admin', 'restaurant_manager', 'delivery'],
  default: 'user',
}
```

## Use Cases

### Scenario 1: Multiple Restaurants Chain
- Create one manager account to manage all restaurants in the chain
- Each restaurant can also have its own restaurant admin for day-to-day operations
- Manager can oversee all operations

### Scenario 2: Single Platform Manager
- Platform owner assigns a manager to handle all restaurant-related operations
- Manager can handle customer service, order management across all restaurants
- Delegates restaurant-specific tasks to individual restaurant admins

### Scenario 3: Regional Manager
- Manager oversees multiple restaurants in a region
- Restaurant admins handle individual restaurant operations
- Manager can step in when needed

## Security Notes

1. **Manager accounts have broad access** - Use with caution
2. **Manager can access all restaurant data** - Ensure proper authentication
3. **Regular audits recommended** - Monitor manager activities
4. **Role hierarchy**: `superAdmin` > `admin` > `restaurant_manager` > `restaurant_admin`

## Testing

Test manager access:
```bash
# Login as manager
POST /api/auth/login
{
  "email": "manager@foodie.com",
  "password": "manager123"
}

# Get all restaurants
GET /api/restaurant-admin/restaurant
Authorization: Bearer <manager_token>

# Get all orders
GET /api/restaurant-admin/orders
Authorization: Bearer <manager_token>

# Get orders for specific restaurant
GET /api/restaurant-admin/orders?restaurantId=xxx
Authorization: Bearer <manager_token>
```

## Migration Notes

- Existing `restaurant_admin` accounts are unaffected
- All existing restaurant admin functionality remains the same
- New `restaurant_manager` role is backward compatible
- Routes support both roles seamlessly


