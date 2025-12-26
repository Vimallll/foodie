// Test script to verify .env file is being loaded correctly
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('=== Environment Variables Test ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT SET');
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

if (!process.env.JWT_SECRET) {
  console.error('\n❌ ERROR: JWT_SECRET is not loaded!');
  process.exit(1);
} else {
  console.log('\n✅ SUCCESS: JWT_SECRET is loaded correctly!');
}

