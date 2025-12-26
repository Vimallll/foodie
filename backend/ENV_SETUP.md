# Environment Variables Setup

## ⚠️ IMPORTANT: Create .env File

You **MUST** create a `.env` file in the `backend` directory before starting the server.

## Quick Setup

1. Copy the example file:
   ```bash
   cd backend
   copy .env.example .env
   ```

2. Edit `.env` and set your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/foodie
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

## Required Variables

### JWT_SECRET (REQUIRED)
- **Purpose**: Secret key for signing JWT tokens
- **Format**: Any string (recommended: 32+ characters, random)
- **Example**: `JWT_SECRET=my_super_secret_key_12345_abcdef`
- **⚠️ CRITICAL**: Must be set or authentication will fail!

### MONGO_URI (REQUIRED)
- **Purpose**: MongoDB connection string
- **Local**: `mongodb://localhost:27017/foodie`
- **Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/foodie`

### PORT (Optional)
- **Default**: 5000
- **Purpose**: Backend server port

### JWT_EXPIRE (Optional)
- **Default**: 7d
- **Purpose**: JWT token expiration time
- **Examples**: `7d`, `24h`, `1h`

## Error: "JWT_SECRET is not defined"

If you see this error:
1. Create `.env` file in `backend` directory
2. Add `JWT_SECRET=your_secret_key_here`
3. Restart the server

## Security Notes

- ⚠️ **Never commit `.env` to git** (it's in .gitignore)
- ✅ Use a strong, random JWT_SECRET in production
- ✅ Keep your `.env` file secure and private

