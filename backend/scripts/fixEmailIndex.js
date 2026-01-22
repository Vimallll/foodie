/**
 * Script to fix the email index to be sparse
 * This allows multiple null/undefined email values while maintaining uniqueness for non-null emails
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const fixEmailIndex = async () => {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    console.log('📋 Current indexes on users collection:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), JSON.stringify(index));
    });

    // Drop existing email index if it exists
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped existing email_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  email_1 index not found, skipping drop');
      } else {
        throw error;
      }
    }

    // Create sparse unique index on email
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Created sparse unique index on email field');

    // Verify the new index
    console.log('\n📋 Updated indexes on users collection:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      if (index.key.email) {
        console.log('  -', JSON.stringify(index.key), JSON.stringify(index));
      }
    });

    console.log('\n✅ Email index fixed successfully!');
    console.log('   Multiple users can now have null/undefined email values');
    console.log('   while maintaining uniqueness for non-null emails.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing email index:', error);
    process.exit(1);
  }
};

fixEmailIndex();



