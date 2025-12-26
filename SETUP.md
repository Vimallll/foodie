# Quick Setup Guide

## Step-by-Step Setup

### 1. Install MongoDB
- Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
- Or use MongoDB Atlas (cloud): [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content from .env.example and update with your values
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/foodie
JWT_SECRET=your_secret_key_here_make_it_long_and_random
JWT_EXPIRE=7d
PORT=5000

# Start backend
npm start
# or for development
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
# REACT_APP_API_URL=http://localhost:5000/api

# Start frontend
npm start
```

### 4. Create Admin User

After starting the application:

1. Register a new user through the signup page
2. Open MongoDB shell or MongoDB Compass
3. Find your user document
4. Update the role field to "admin":

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or use this script in backend directory:

```javascript
// createAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await User.findOneAndUpdate(
    { email: 'admin@foodie.com' },
    {
      name: 'Admin',
      email: 'admin@foodie.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin'
    },
    { upsert: true, new: true }
  );
  console.log('Admin created:', admin);
  process.exit();
});
```

### 5. Add Sample Data

You can add sample data through the admin panel after logging in as admin, or use MongoDB directly:

```javascript
// Sample Categories
db.categories.insertMany([
  { name: "Pizza", description: "Delicious pizzas" },
  { name: "Burgers", description: "Juicy burgers" },
  { name: "Pasta", description: "Italian pasta" },
  { name: "Salads", description: "Fresh salads" },
  { name: "Desserts", description: "Sweet treats" }
]);

// Sample Restaurants
db.restaurants.insertMany([
  {
    name: "Pizza Palace",
    description: "Best pizza in town",
    phone: "123-456-7890",
    deliveryTime: 30,
    isActive: true
  },
  {
    name: "Burger House",
    description: "Gourmet burgers",
    phone: "123-456-7891",
    deliveryTime: 25,
    isActive: true
  }
]);
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` (for local) or check your Atlas connection string
- Verify MONGO_URI in .env file

### Port Already in Use
- Change PORT in backend/.env
- Or kill the process using the port

### CORS Errors
- Make sure backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend/.env
- Verify token is being sent in request headers

## Default Credentials

After creating admin user:
- Email: admin@foodie.com (or your email)
- Password: admin123 (or your password)

**Note:** Change default credentials in production!

