const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: function() {
      return this.role !== 'delivery'; // Email not required for delivery partners
    },
    unique: true,
    sparse: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'superAdmin', 'delivery'],
    default: 'user',
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BUSY', 'OFFLINE', 'ONLINE'],
    default: 'ONLINE',
  },
  active: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    required: function() {
      return this.role === 'delivery'; // Phone required for delivery partners
    },
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  // Delivery partner live location tracking
  currentLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    lastUpdated: { type: Date, default: null },
  },
  // Delivery Partner Specific Fields - ONLY for delivery role
  // Use Mixed type to avoid any type coercion issues
  vehicleType: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default: undefined, // Explicitly undefined, never null
    sparse: true,
    select: false,
    // CRITICAL: Validator that ALWAYS returns true for null/undefined OR non-delivery users
    validate: {
      validator: function(value) {
        // FIRST: Always allow null, undefined, or empty strings - this handles all edge cases
        // This must be checked FIRST before any other validation
        if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
          return true; // ALWAYS allow empty/null values - no validation needed
        }
        
        // SECOND: Check role - default to 'user' for new documents
        const userRole = (this && this.role !== undefined && this.role !== null) ? this.role : 'user';
        
        // For non-delivery users, ALWAYS return true (field should not exist anyway)
        if (userRole !== 'delivery') {
          return true; // Always allow - field should not exist for non-delivery users
        }
        
        // THIRD: Only validate for delivery partners when a value is provided
        // Validate enum values
        const validTypes = ['bike', 'cycle', 'scooter'];
        return validTypes.includes(String(value));
      },
      message: 'Vehicle type must be bike, cycle, or scooter'
    },
  },
  vehicleNumber: {
    type: String,
    default: '',
  },
  drivingLicenseNumber: {
    type: String,
    default: '',
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  availabilityStatus: {
    type: String,
    enum: ['OFFLINE', 'ONLINE', 'BUSY'],
    default: 'ONLINE',
  },
  // OTP Verification Fields
  phoneOtp: {
    type: String,
    select: false,
  },
  phoneOtpExpiry: {
    type: Date,
    select: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  // Email Verification Fields
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpiry: {
    type: Date,
    select: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Schema options to help with validation
  validateBeforeSave: true,
  strict: true
});

// CRITICAL: Clean up delivery-specific fields for non-delivery users BEFORE validation
// This hook runs before Mongoose validation, ensuring vehicleType is never validated for regular users
userSchema.pre('validate', function (next) {
  try {
    // Get role - default to 'user' for new documents (which is what normal signup creates)
    const userRole = (this.role !== undefined && this.role !== null) ? this.role : 'user';
    
    // For ALL non-delivery users, ALWAYS remove vehicleType completely before validation
    // This ensures Mongoose never tries to validate it for regular users
    if (userRole !== 'delivery') {
      // Completely remove the field using all possible methods
      if ('vehicleType' in this) {
        delete this.vehicleType;
      }
      if (this.vehicleType !== undefined) {
        delete this.vehicleType;
      }
      if (this.vehicleType === null) {
        delete this.vehicleType;
      }
      
      // Mark as unset to prevent Mongoose from including it in validation/save
      this.$unset = this.$unset || {};
      this.$unset.vehicleType = '';
      
      // Remove from Mongoose internal structures
      if (this._doc) {
        delete this._doc.vehicleType;
      }
      
      // Remove from modified paths to prevent validation
      if (this.$__ && this.$__.modifiedPaths) {
        const index = this.$__.modifiedPaths.indexOf('vehicleType');
        if (index > -1) {
          this.$__.modifiedPaths.splice(index, 1);
        }
      }
      
      // Also remove from direct properties
      if (this.isDirectModified && this.isDirectModified('vehicleType')) {
        this.unset('vehicleType');
      }
    }
    next();
  } catch (error) {
    console.error('Pre-validate hook error:', error);
    // Continue even if hook fails - don't block validation
    next();
  }
});

// Clean up delivery-specific fields before saving (runs after validation)
userSchema.pre('save', function (next) {
  try {
    // Final cleanup: Ensure vehicleType is completely removed for non-delivery users
    // This is a safety check to ensure it's never saved to the database
    if (this.role !== 'delivery') {
      // Remove the field completely
      if ('vehicleType' in this) {
        delete this.vehicleType;
      }
      // Ensure it's unset
      if (this.$unset === undefined) {
        this.$unset = {};
      }
      this.$unset.vehicleType = '';
      // Also remove other delivery-specific fields that shouldn't be saved
      if ('vehicleNumber' in this && !this.vehicleNumber) {
        delete this.vehicleNumber;
        this.$unset.vehicleNumber = '';
      }
      if ('drivingLicenseNumber' in this && !this.drivingLicenseNumber) {
        delete this.drivingLicenseNumber;
        this.$unset.drivingLicenseNumber = '';
      }
    }
    next();
  } catch (error) {
    console.error('Pre-save hook error (vehicleType cleanup):', error);
    next(); // Don't block save
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate JWT token
userSchema.methods.generateToken = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    console.error('❌ JWT_SECRET is missing or empty');
    console.error('Please check your .env file in the backend directory');
    throw new Error('JWT_SECRET is not defined. Please set it in your .env file.');
  }
  return jwt.sign({ id: this._id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
