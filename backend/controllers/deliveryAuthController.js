const User = require('../models/User');
const crypto = require('crypto');
const { sendEmailVerification, sendOTPEmail } = require('../utils/email');

// Helper function to generate OTP (placeholder - integrate with SMS service in production)
const generateOTP = () => {
  // For development: return fixed OTP. In production, use SMS service or random
  if (process.env.NODE_ENV === 'development') {
    return '123456'; // Fixed for testing
  }
  // Generate random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate email verification token
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @desc    Register Delivery Partner
// @route   POST /api/delivery/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      profilePhoto,
    } = req.body;

    // Validation
    if (!fullName || !phoneNumber || !password || !vehicleType || !vehicleNumber || !drivingLicenseNumber) {
      return res.status(400).json({
        message: 'Please provide all required fields: fullName, phoneNumber, password, vehicleType, vehicleNumber, drivingLicenseNumber',
      });
    }

    if (!['bike', 'cycle', 'scooter'].includes(vehicleType)) {
      return res.status(400).json({
        message: 'vehicleType must be one of: bike, cycle, scooter',
      });
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({
      $or: [
        { phone: phoneNumber },
        { phoneNumber: phoneNumber },
      ],
      role: 'delivery',
    });

    if (phoneExists) {
      return res.status(400).json({
        message: 'Phone number already registered',
      });
    }

    // Check if email exists (if provided)
    if (email) {
      const emailExists = await User.findOne({ email, role: 'delivery' });
      if (emailExists) {
        return res.status(400).json({
          message: 'Email already registered',
        });
      }
    }

    // Generate OTP (in production, send via SMS)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate email verification token if email provided
    let emailVerificationToken, emailVerificationExpiry;
    if (email) {
      emailVerificationToken = generateEmailVerificationToken();
      emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Create delivery partner (unverified initially)
    // Only include email and related fields if email is provided
    const deliveryPartnerData = {
      name: fullName,
      fullName: fullName,
      phone: phoneNumber,
      phoneNumber: phoneNumber,
      password,
      role: 'delivery',
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      profilePhoto: profilePhoto || '',
      isVerified: false,
      isActive: true,
      availabilityStatus: 'ONLINE',
      status: 'ONLINE',
      phoneOtp: otp,
      phoneOtpExpiry: otpExpiry,
      isPhoneVerified: false,
      isEmailVerified: false,
    };

    // Only include email if it's provided
    if (email) {
      deliveryPartnerData.email = email;
      deliveryPartnerData.emailVerificationToken = emailVerificationToken;
      deliveryPartnerData.emailVerificationExpiry = emailVerificationExpiry;
    }

    const deliveryPartner = await User.create(deliveryPartnerData);

    // Send email verification if email provided
    if (email && emailVerificationToken) {
      try {
        await sendEmailVerification(email, emailVerificationToken, fullName);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails, but log it
      }
    }

    // Send OTP via email as fallback if email provided
    if (email) {
      try {
        await sendOTPEmail(email, otp, fullName);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
      }
    }

    // Return without sensitive data
    res.status(201).json({
      success: true,
      message: 'Delivery partner registered successfully. Please verify OTP and email to activate account.',
      data: {
        id: deliveryPartner._id,
        fullName: deliveryPartner.fullName,
        phoneNumber: deliveryPartner.phoneNumber,
        email: deliveryPartner.email,
        vehicleType: deliveryPartner.vehicleType,
        isVerified: deliveryPartner.isVerified,
        isPhoneVerified: false,
        isEmailVerified: false,
        // In development, return OTP. In production, send via SMS
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
    });
  } catch (error) {
    console.error('Delivery partner registration error:', error);
    res.status(500).json({
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Verify OTP for Delivery Partner
// @route   POST /api/delivery/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        message: 'Phone number and OTP are required',
      });
    }

    const deliveryPartner = await User.findOne({
      $or: [
        { phone: phoneNumber },
        { phoneNumber: phoneNumber },
      ],
      role: 'delivery',
    }).select('+phoneOtp +phoneOtpExpiry');

    if (!deliveryPartner) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    // Check if OTP is valid
    if (!deliveryPartner.phoneOtp || deliveryPartner.phoneOtp !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    // Check if OTP is expired
    if (new Date() > deliveryPartner.phoneOtpExpiry) {
      return res.status(400).json({
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Verify phone number
    deliveryPartner.isPhoneVerified = true;
    deliveryPartner.phoneOtp = undefined;
    deliveryPartner.phoneOtpExpiry = undefined;
    
    // If both phone and email are verified, mark as fully verified (admin still needs to approve)
    // Admin verification (isVerified) is separate and required for going online
    await deliveryPartner.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        id: deliveryPartner._id,
        phoneNumber: deliveryPartner.phoneNumber,
        isPhoneVerified: true,
        isEmailVerified: deliveryPartner.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      message: error.message || 'Server error during OTP verification',
    });
  }
};

// @desc    Login Delivery Partner
// @route   POST /api/delivery/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { phoneNumber, email, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
      });
    }

    if (!phoneNumber && !email) {
      return res.status(400).json({
        message: 'Phone number or email is required',
      });
    }

    // Find delivery partner by phone or email
    let deliveryPartner;
    if (phoneNumber) {
      deliveryPartner = await User.findOne({
        $or: [
          { phone: phoneNumber },
          { phoneNumber: phoneNumber },
        ],
        role: 'delivery',
      }).select('+password');
    } else {
      deliveryPartner = await User.findOne({
        email,
        role: 'delivery',
      }).select('+password');
    }

    if (!deliveryPartner) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!deliveryPartner.isActive) {
      return res.status(403).json({
        message: 'Account is blocked. Please contact admin.',
      });
    }

    // Check password
    const isMatch = await deliveryPartner.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Check verification status - phone verification is required
    if (!deliveryPartner.isPhoneVerified) {
      return res.status(403).json({
        message: 'Please verify your phone number first. Check OTP sent to your phone/email.',
        requiresVerification: true,
        verificationType: 'phone',
        phoneNumber: deliveryPartner.phoneNumber,
      });
    }

    // Email verification is optional - only warn if email exists but isn't verified
    // Don't block login, just inform the user they can verify email later
    const emailVerificationWarning = deliveryPartner.email && !deliveryPartner.isEmailVerified
      ? 'Note: Your email is not verified. You can verify it later from your profile.'
      : null;

    // Set delivery partner to ONLINE by default on login (if verified)
    if (deliveryPartner.isVerified) {
      deliveryPartner.availabilityStatus = 'ONLINE';
      deliveryPartner.status = 'ONLINE';
      deliveryPartner.isAvailable = true;
      await deliveryPartner.save();
    }

    // Generate token
    let token;
    try {
      token = deliveryPartner.generateToken();
    } catch (tokenError) {
      return res.status(500).json({
        message: 'Server configuration error: JWT_SECRET not set',
      });
    }

    // Refresh delivery partner data after status update
    const updatedPartner = await User.findById(deliveryPartner._id);

    // Return delivery partner data
    const responseData = {
      success: true,
      token,
      data: {
        id: updatedPartner._id,
        fullName: updatedPartner.fullName || updatedPartner.name,
        phoneNumber: updatedPartner.phoneNumber || updatedPartner.phone,
        email: updatedPartner.email,
        vehicleType: updatedPartner.vehicleType,
        vehicleNumber: updatedPartner.vehicleNumber,
        profilePhoto: updatedPartner.profilePhoto,
        isVerified: updatedPartner.isVerified,
        isActive: updatedPartner.isActive,
        availabilityStatus: updatedPartner.availabilityStatus,
        isPhoneVerified: updatedPartner.isPhoneVerified,
        isEmailVerified: updatedPartner.isEmailVerified,
        role: updatedPartner.role,
      },
    };

    // Add warning if email is not verified (but don't block login)
    if (emailVerificationWarning) {
      responseData.warning = emailVerificationWarning;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Delivery partner login error:', error);
    res.status(500).json({
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get Delivery Partner Profile
// @route   GET /api/delivery/auth/me
// @access  Private/Delivery
exports.getMe = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const deliveryPartner = await User.findById(userId);

    if (!deliveryPartner) {
      console.error('GetMe: User not found', { userId, reqUser: req.user });
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (deliveryPartner.role !== 'delivery') {
      console.error('GetMe: User role is not delivery', { 
        userId, 
        actualRole: deliveryPartner.role,
        expectedRole: 'delivery'
      });
      return res.status(403).json({
        message: `Access denied. Expected delivery role, but user has role: ${deliveryPartner.role}`,
      });
    }

    res.json({
      success: true,
      data: {
        id: deliveryPartner._id,
        fullName: deliveryPartner.fullName || deliveryPartner.name,
        phoneNumber: deliveryPartner.phoneNumber || deliveryPartner.phone,
        email: deliveryPartner.email,
        vehicleType: deliveryPartner.vehicleType,
        vehicleNumber: deliveryPartner.vehicleNumber,
        drivingLicenseNumber: deliveryPartner.drivingLicenseNumber,
        profilePhoto: deliveryPartner.profilePhoto,
        isVerified: deliveryPartner.isVerified,
        isActive: deliveryPartner.isActive,
        availabilityStatus: deliveryPartner.availabilityStatus,
        status: deliveryPartner.status,
        isPhoneVerified: deliveryPartner.isPhoneVerified,
        address: deliveryPartner.address,
        createdAt: deliveryPartner.createdAt,
      },
    });
  } catch (error) {
    console.error('Get delivery partner profile error:', error);
    res.status(500).json({
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update Delivery Partner Profile
// @route   PUT /api/delivery/auth/profile
// @access  Private/Delivery
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, address } = req.body;

    const deliveryPartner = await User.findById(req.user.id);

    if (!deliveryPartner || deliveryPartner.role !== 'delivery') {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    // Update fields
    if (fullName) {
      deliveryPartner.fullName = fullName;
      deliveryPartner.name = fullName;
    }
    if (phoneNumber) {
      deliveryPartner.phoneNumber = phoneNumber;
      deliveryPartner.phone = phoneNumber;
    }
    if (address) {
      deliveryPartner.address = {
        ...deliveryPartner.address,
        ...address,
      };
    }

    await deliveryPartner.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: deliveryPartner._id,
        fullName: deliveryPartner.fullName || deliveryPartner.name,
        phoneNumber: deliveryPartner.phoneNumber || deliveryPartner.phone,
        email: deliveryPartner.email,
        vehicleType: deliveryPartner.vehicleType,
        vehicleNumber: deliveryPartner.vehicleNumber,
        drivingLicenseNumber: deliveryPartner.drivingLicenseNumber,
        profilePhoto: deliveryPartner.profilePhoto,
        isVerified: deliveryPartner.isVerified,
        isActive: deliveryPartner.isActive,
        availabilityStatus: deliveryPartner.availabilityStatus,
        status: deliveryPartner.status,
        isPhoneVerified: deliveryPartner.isPhoneVerified,
        address: deliveryPartner.address,
      },
    });
  } catch (error) {
    console.error('Update delivery partner profile error:', error);
    res.status(500).json({
      message: error.message || 'Server error',
    });
  }
};

// @desc    Logout Delivery Partner
// @route   POST /api/delivery/logout
// @access  Private/Delivery
exports.logout = async (req, res) => {
  try {
    // Set availability status to OFFLINE
    const deliveryPartner = await User.findById(req.user.id);
    if (deliveryPartner) {
      deliveryPartner.availabilityStatus = 'OFFLINE';
      deliveryPartner.status = 'OFFLINE';
      await deliveryPartner.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: error.message || 'Server error during logout',
    });
  }
};

// @desc    Verify Email for Delivery Partner
// @route   GET /api/delivery/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: 'Verification token is required',
      });
    }

    // Find delivery partner by token
    const deliveryPartner = await User.findOne({
      emailVerificationToken: token,
      role: 'delivery',
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!deliveryPartner) {
      return res.status(400).json({
        message: 'Invalid or expired verification token',
      });
    }

    // Check if token is expired
    if (new Date() > deliveryPartner.emailVerificationExpiry) {
      return res.status(400).json({
        message: 'Verification token has expired. Please request a new one.',
      });
    }

    // Verify email
    deliveryPartner.isEmailVerified = true;
    deliveryPartner.emailVerificationToken = undefined;
    deliveryPartner.emailVerificationExpiry = undefined;
    await deliveryPartner.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        id: deliveryPartner._id,
        email: deliveryPartner.email,
        isEmailVerified: true,
        isPhoneVerified: deliveryPartner.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      message: error.message || 'Server error during email verification',
    });
  }
};

// @desc    Resend OTP for Delivery Partner
// @route   POST /api/delivery/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        message: 'Phone number is required',
      });
    }

    const deliveryPartner = await User.findOne({
      $or: [
        { phone: phoneNumber },
        { phoneNumber: phoneNumber },
      ],
      role: 'delivery',
    }).select('+phoneOtp +phoneOtpExpiry');

    if (!deliveryPartner) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (deliveryPartner.isPhoneVerified) {
      return res.status(400).json({
        message: 'Phone number is already verified',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    deliveryPartner.phoneOtp = otp;
    deliveryPartner.phoneOtpExpiry = otpExpiry;
    await deliveryPartner.save();

    // Send OTP via email if email exists
    if (deliveryPartner.email) {
      try {
        await sendOTPEmail(deliveryPartner.email, otp, deliveryPartner.fullName || deliveryPartner.name);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In development, return OTP
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      message: error.message || 'Server error during OTP resend',
    });
  }
};

// @desc    Resend Email Verification for Delivery Partner
// @route   POST /api/delivery/auth/resend-email-verification
// @access  Public
exports.resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const deliveryPartner = await User.findOne({
      email,
      role: 'delivery',
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!deliveryPartner) {
      return res.status(404).json({
        message: 'Delivery partner not found',
      });
    }

    if (deliveryPartner.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    deliveryPartner.emailVerificationToken = emailVerificationToken;
    deliveryPartner.emailVerificationExpiry = emailVerificationExpiry;
    await deliveryPartner.save();

    // Send verification email
    try {
      await sendEmailVerification(email, emailVerificationToken, deliveryPartner.fullName || deliveryPartner.name);
      res.json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({
        message: 'Failed to send verification email. Please try again later.',
      });
    }
  } catch (error) {
    console.error('Resend email verification error:', error);
    res.status(500).json({
      message: error.message || 'Server error during email verification resend',
    });
  }
};

