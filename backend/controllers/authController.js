const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Debug: Log the request body to see what we're receiving
    console.log('Registration request body:', JSON.stringify(req.body));
    
    const { name, email, password } = req.body;

    // Validate that request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is empty. Please provide name, email, and password.' });
    }

    // Validate required fields - check for existence and non-empty values
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Please provide a valid name' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }
    if (!password || typeof password !== 'string' || !password.trim() || password.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a valid password' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Trim and validate email format
    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();
    
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user - CRITICAL: Only include fields needed for a regular user
    // NEVER include vehicleType or any delivery fields
    // Double-check that all required values are present and valid
    if (!trimmedName || trimmedName.length === 0) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    if (!trimmedEmail || trimmedEmail.length === 0) {
      return res.status(400).json({ message: 'Email cannot be empty' });
    }
    if (!trimmedPassword || trimmedPassword.length === 0) {
      return res.status(400).json({ message: 'Password cannot be empty' });
    }

    const userData = {
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: 'user', // Explicitly set role - this ensures vehicleType validation is skipped
    };
    
    // CRITICAL: Ensure vehicleType is NEVER in the userData object
    // Also ensure it's not in req.body
    delete userData.vehicleType;
    delete userData.vehicleNumber;
    delete userData.drivingLicenseNumber;
    
    // Debug: Log userData before creating (without password)
    console.log('Creating user with data:', { 
      name: userData.name, 
      email: userData.email, 
      role: userData.role,
      hasPassword: !!userData.password 
    });
    
    // Create user
    // The pre-validate hook will remove vehicleType before validation runs
    const user = await User.create(userData);

    // Generate token
    let token;
    try {
      token = user.generateToken();
    } catch (tokenError) {
      return res.status(500).json({ 
        message: 'Server configuration error: JWT_SECRET not set. Please configure your .env file.' 
      });
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    // If it's a Mongoose validation error, provide a better message
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ 
        message: `Validation failed: ${errors}`,
        details: error.errors 
      });
    }
    // For other errors, return the error message
    res.status(500).json({ 
      message: error.message || 'An error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    let token;
    try {
      token = user.generateToken();
    } catch (tokenError) {
      return res.status(500).json({ 
        message: 'Server configuration error: JWT_SECRET not set. Please configure your .env file.' 
      });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

