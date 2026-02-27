const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');

// @desc    Register a user as a Home Chef
// @route   POST /api/chefs/register
// @access  Private (User)
exports.registerChef = async (req, res) => {
    try {
        const {
            kitchenName, bio, specialties, experience, availability,
            fssaiLicenseNumber, fssaiLicenseImage, idProofType, idProofImage,
            deliveryMode, deliveryRadius, deliveryCharges
        } = req.body;

        // Update user role and add chef profile
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                // role: 'homeChef', // Role will be updated upon admin approval
                chefProfile: {
                    kitchenName,
                    bio,
                    specialties,
                    experience,
                    availability: availability || { isAvailable: true, schedule: 'Flexible' },
                    // New Fields
                    fssaiLicenseNumber,
                    fssaiLicenseImage,
                    idProofType,
                    idProofImage,
                    deliveryMode: deliveryMode || 'platform',
                    deliveryRadius: deliveryRadius || 5,
                    deliveryCharges: deliveryCharges || 0,
                    chefStatus: 'pending' // Reset to pending on new registration details? Or just initial.
                }
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: user,
            message: 'Congratulations! You are now a Home Chef.'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all Home Chefs
// @route   GET /api/chefs
// @access  Public
exports.getChefs = async (req, res) => {
    try {
        const chefs = await User.find({ role: 'homeChef' })
            .select('name email chefProfile')
            .lean();

        res.json({
            success: true,
            count: chefs.length,
            data: chefs
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single Chef by ID
// @route   GET /api/chefs/:id
// @access  Public
exports.getChefById = async (req, res) => {
    try {
        const chef = await User.findOne({ _id: req.params.id, role: 'homeChef' })
            .select('name email chefProfile');

        if (!chef) {
            return res.status(404).json({ success: false, message: 'Chef not found' });
        }

        // Get chef's menu
        const menu = await Food.find({ chef: chef._id, foodType: 'home' });

        res.json({
            success: true,
            data: {
                ...chef.toObject(),
                menu
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update Chef Profile
// @route   PUT /api/chefs/profile
// @access  Private (Home Chef)
exports.updateChefProfile = async (req, res) => {
    try {
        const {
            kitchenName, bio, specialties, availability, isAvailable,
            deliveryMode, deliveryRadius, deliveryCharges
        } = req.body;

        // Build update object
        const updateFields = {};
        if (kitchenName) updateFields['chefProfile.kitchenName'] = kitchenName;
        if (bio) updateFields['chefProfile.bio'] = bio;
        if (specialties) updateFields['chefProfile.specialties'] = specialties;
        if (availability) updateFields['chefProfile.availability'] = availability;

        // Update Delivery Settings
        if (deliveryMode) updateFields['chefProfile.deliveryMode'] = deliveryMode;
        if (deliveryRadius) updateFields['chefProfile.deliveryRadius'] = deliveryRadius;
        if (deliveryCharges !== undefined) updateFields['chefProfile.deliveryCharges'] = deliveryCharges;

        // Allow updating main user availability status too
        if (isAvailable !== undefined) updateFields['isAvailable'] = isAvailable;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get Chef Dashboard Stats
// @route   GET /api/chefs/dashboard
// @access  Private (Home Chef)
exports.getChefDashboardWrapper = async (req, res) => {
    // This is just a wrapper or placeholder if needed, 
    // but typically dashboard data comes from orders and foods
    try {
        const dishes = await Food.countDocuments({ chef: req.user.id });
        const orders = await Order.countDocuments({ chef: req.user.id });
        const totalEarnings = await Order.aggregate([
            { $match: { chef: req.user.id, status: 'DELIVERED' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            data: {
                dishes,
                orders,
                earnings: totalEarnings[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// @desc    Get Chef Earnings Details
// @route   GET /api/chefs/earnings
// @access  Private (Home Chef)
exports.getChefEarnings = async (req, res) => {
    try {
        const chef = await User.findById(req.user.id).select('chefProfile');

        // Get delivered orders
        const deliveredOrders = await Order.find({
            chef: req.user.id,
            status: 'DELIVERED'
        }).sort({ deliveredAt: -1 }).limit(50);

        // Calculate earnings breakdown
        const platformCommissionRate = 0.15; // 15% platform commission
        const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const platformCommission = Math.round(totalRevenue * platformCommissionRate);
        const netEarnings = totalRevenue - platformCommission;

        // This week's earnings
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weeklyOrders = deliveredOrders.filter(o => new Date(o.deliveredAt || o.updatedAt) >= weekStart);
        const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const weeklyEarnings = Math.round(weeklyRevenue * (1 - platformCommissionRate));

        res.json({
            success: true,
            data: {
                totalRevenue,
                platformCommission,
                netEarnings,
                weeklyEarnings,
                weeklyOrders: weeklyOrders.length,
                walletBalance: chef.chefProfile?.walletBalance || 0,
                totalEarnings: chef.chefProfile?.totalEarnings || 0,
                payoutHistory: chef.chefProfile?.payoutHistory || [],
                recentOrders: deliveredOrders.slice(0, 10).map(o => ({
                    _id: o._id,
                    amount: o.totalAmount,
                    date: o.deliveredAt || o.updatedAt,
                    items: o.items.length
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Request Payout
// @route   POST /api/chefs/payout
// @access  Private (Home Chef)
exports.requestPayout = async (req, res) => {
    try {
        const { amount, upiId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payout amount' });
        }
        if (!upiId) {
            return res.status(400).json({ success: false, message: 'UPI ID is required' });
        }

        const chef = await User.findById(req.user.id);
        const walletBalance = chef.chefProfile?.walletBalance || 0;

        if (amount > walletBalance) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Deduct from wallet and add to payout history
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'chefProfile.walletBalance': -amount },
            $push: {
                'chefProfile.payoutHistory': {
                    amount,
                    upiId,
                    status: 'pending',
                    requestedAt: new Date()
                }
            }
        });

        res.json({
            success: true,
            message: `Payout of ₹${amount} requested successfully. It will be processed within 24-48 hours.`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
