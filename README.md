# Foodie - Food Delivery Website (MERN Stack)

A complete food delivery website built with MongoDB, Express, React, and Node.js. This project includes both frontend and backend with full authentication, cart management, order processing, and admin panel.

## Features

### User Features
- User registration and login with JWT authentication
- Browse foods with search and filter functionality
- Add items to cart and manage quantities
- Place orders with delivery address
- View order history and track order status
- Update user profile and save delivery address

### Admin Features
- Admin dashboard with analytics
- Manage foods (CRUD operations)
- Manage categories and restaurants
- View and update order status
- View all users

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router
- Context API for state management
- Axios for API calls
- React Toastify for notifications

## Project Structure

```
foodie/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   ├── foodController.js
│   │   ├── orderController.js
│   │   ├── restaurantController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Food.js
│   │   ├── Order.js
│   │   ├── Restaurant.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── categories.js
│   │   ├── foods.js
│   │   ├── orders.js
│   │   ├── restaurants.js
│   │   └── users.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.js
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Categories.js
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── Foods.js
│   │   │   │   ├── Orders.js
│   │   │   │   ├── Restaurants.js
│   │   │   │   └── Users.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── FoodDetails.js
│   │   │   ├── Foods.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── OrderDetails.js
│   │   │   ├── Orders.js
│   │   │   ├── Profile.js
│   │   │   └── Signup.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. **⚠️ IMPORTANT: Create a `.env` file** in the backend directory:
   - A `.env` file should have been auto-created, but if not:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Or create manually with:
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/foodie
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_characters
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Verify `.env` file exists** and has `JWT_SECRET` set (required for authentication)

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

**Note:** If you see "JWT_SECRET is not defined" error, make sure your `.env` file exists and contains `JWT_SECRET=...`

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Foods
- `GET /api/foods` - Get all foods (with query params: search, category, restaurant, page, limit)
- `GET /api/foods/:id` - Get single food
- `POST /api/foods` - Create food (Admin only)
- `PUT /api/foods/:id` - Update food (Admin only)
- `DELETE /api/foods/:id` - Delete food (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create restaurant (Admin only)
- `PUT /api/restaurants/:id` - Update restaurant (Admin only)
- `DELETE /api/restaurants/:id` - Delete restaurant (Admin only)

### Cart
- `GET /api/cart` - Get user cart (Protected)
- `POST /api/cart` - Add item to cart (Protected)
- `PUT /api/cart/:itemId` - Update cart item quantity (Protected)
- `DELETE /api/cart/:itemId` - Remove item from cart (Protected)
- `DELETE /api/cart` - Clear cart (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `GET /api/orders/all` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)
- `GET /api/users` - Get all users (Admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (Admin only)

## Sample Test Data

### Create Admin User
You can create an admin user by directly inserting into MongoDB or by modifying the registration to allow admin creation:

```javascript
// In MongoDB shell or using a script
db.users.insertOne({
  name: "Admin",
  email: "admin@foodie.com",
  password: "$2a$10$...", // hashed password
  role: "admin"
})
```

Or register a user normally and update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Sample Categories
```json
[
  { "name": "Pizza", "description": "Delicious pizzas" },
  { "name": "Burgers", "description": "Juicy burgers" },
  { "name": "Pasta", "description": "Italian pasta dishes" },
  { "name": "Salads", "description": "Fresh salads" },
  { "name": "Desserts", "description": "Sweet treats" }
]
```

### Sample Restaurants
```json
[
  {
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "phone": "123-456-7890",
    "deliveryTime": 30
  },
  {
    "name": "Burger House",
    "description": "Gourmet burgers",
    "phone": "123-456-7891",
    "deliveryTime": 25
  }
]
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Default Password for Testing

For testing purposes, you can register a new user or create one directly in MongoDB. To create an admin user, register normally and then update the role in the database.

## Running the Application

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm start
```

3. Start the frontend (in a new terminal):
```bash
cd frontend
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Features Implemented

✅ User authentication (Register, Login, Logout)
✅ JWT token-based authentication
✅ Protected routes (User & Admin)
✅ Food browsing with search and filters
✅ Shopping cart functionality
✅ Order placement and tracking
✅ User profile management
✅ Admin dashboard
✅ Food management (CRUD)
✅ Category management (CRUD)
✅ Restaurant management (CRUD)
✅ Order management
✅ User management
✅ Responsive design
✅ Toast notifications

## Future Enhancements

- Image upload functionality (Cloudinary integration)
- Payment gateway integration (Stripe/Razorpay)
- Real-time order tracking
- Email notifications
- Review and rating system
- Coupon/discount system
- Advanced search with filters
- Pagination improvements
- Order cancellation by users
- Multiple delivery addresses

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please create an issue in the repository.

