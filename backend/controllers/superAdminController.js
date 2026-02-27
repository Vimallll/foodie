const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');
const { sendEmail } = require('../utils/email');

// @desc    Get all Home Chef applications
// @route   GET /api/super-admin/chefs
// @access  Private (Super Admin)
exports.getAllChefApplications = async (req, res) => {
    try {
        const { status } = req.query;
        // Query based on chefProfile existence
        let query = { 'chefProfile': { $exists: true } };

        if (status && ['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
            query['chefProfile.chefStatus'] = status;
        } else if (status === 'all') {
            // No filter needed, return all applications
        } else {
            // Default to pending if no status provided? Or all? Let's default to pending for safety if undefined, but 'all' handles explicit all.
            // If status is undefined, maybe default to pending?
            if (!status) query['chefProfile.chefStatus'] = 'pending';
        }

        const chefs = await User.find(query)
            .select('name email phone phoneNumber address chefProfile createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: chefs.length,
            data: chefs
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update Home Chef Status (Approve/Reject/Suspend)
// @route   PUT /api/super-admin/chef/:id/status
// @access  Private (Super Admin)
exports.updateChefStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const chefId = req.params.id;

        if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const chef = await User.findById(chefId);

        if (!chef) {
            return res.status(404).json({ success: false, message: 'Chef not found' });
        }

        // Update status
        chef.chefProfile.chefStatus = status;

        // Update Role based on status and manage rejection reason
        if (status === 'approved') {
            chef.role = 'homeChef';
            chef.chefProfile.rejectionReason = ''; // Clear rejection reason on approval
        } else if (status === 'rejected' || status === 'suspended') {
            chef.role = 'user'; // Revert to user if rejected/suspended to remove dashboard access
            if (status === 'rejected') {
                chef.chefProfile.rejectionReason = rejectionReason || 'No reason provided';
            } else {
                chef.chefProfile.rejectionReason = ''; // Clear rejection reason if suspended
            }
        } else { // For 'pending' status
            chef.chefProfile.rejectionReason = ''; // Clear rejection reason if status is set back to pending
        }

        await chef.save();

        // Send Email Notification
        const message = status === 'approved'
            ? `Dear ${chef.name},\n\nCongratulations! Your Home Chef application has been approved. You can now log in to your dashboard, manage your menu, and start receiving orders.\n\nWelcome to the Foodie Family!\n\nBest Regards,\nFoodie Team`
            : `Dear ${chef.name},\n\nWe regret to inform you that your Home Chef application has been rejected.\n\nReason: ${rejectionReason}\n\nIf you have any questions, please contact support.\n\nBest Regards,\nFoodie Team`;

        const subject = status === 'approved'
            ? '🎉 Home Chef API Application Approved - Foodie'
            : 'Home Chef Application Status Update - Foodie';

        if (status === 'approved' || status === 'rejected') {
            try {
                await sendEmail({
                    email: chef.email,
                    subject: subject,
                    message: message, // Or html
                    html: message.replace(/\n/g, '<br>')
                });
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
                // Don't fail the request if email fails, just log it
            }
        }

        res.json({
            success: true,
            data: chef,
            message: `Chef status updated to ${status}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get Super Admin Analytics
// @route   GET /api/super-admin/analytics
// @access  Private (Super Admin)
exports.getSuperAdminAnalytics = async (req, res) => {
    try {
        // Chef Stats
        const totalChefs = await User.countDocuments({ 'chefProfile.kitchenName': { $exists: true } });
        const pendingChefs = await User.countDocuments({ 'chefProfile.chefStatus': 'pending' });
        const approvedChefs = await User.countDocuments({ 'chefProfile.chefStatus': 'approved' });
        const rejectedChefs = await User.countDocuments({ 'chefProfile.chefStatus': 'rejected' });
        const suspendedChefs = await User.countDocuments({ 'chefProfile.chefStatus': 'suspended' });

        // Order & Revenue Stats
        const totalHomeOrders = await Order.countDocuments({ chef: { $exists: true, $ne: null } });
        const deliveredHomeOrders = await Order.countDocuments({ chef: { $exists: true, $ne: null }, status: 'DELIVERED' });

        const revenueAgg = await Order.aggregate([
            { $match: { chef: { $exists: true, $ne: null }, status: 'DELIVERED' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
        const platformEarnings = Math.round(totalRevenue * 0.15); // 15% commission

        // Recent Chefs
        const recentChefs = await User.find({ 'chefProfile.chefStatus': 'pending' })
            .select('name email createdAt')
            .limit(5)
            .sort({ createdAt: -1 });

        // Pending Payouts
        const chefsWithPayouts = await User.find({
            'chefProfile.payoutHistory.status': 'pending'
        }).select('name chefProfile.payoutHistory');

        let pendingPayouts = 0;
        chefsWithPayouts.forEach(c => {
            c.chefProfile?.payoutHistory?.forEach(p => {
                if (p.status === 'pending') pendingPayouts++;
            });
        });

        res.json({
            success: true,
            data: {
                chefs: {
                    total: totalChefs,
                    pending: pendingChefs,
                    approved: approvedChefs,
                    rejected: rejectedChefs,
                    suspended: suspendedChefs
                },
                orders: {
                    totalHomeKitchen: totalHomeOrders,
                    delivered: deliveredHomeOrders
                },
                revenue: {
                    totalRevenue,
                    platformEarnings
                },
                pendingPayouts,
                recentPending: recentChefs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get detailed Chef Profile (Admin view)
// @route   GET /api/super-admin/chef/:id
// @access  Private (Super Admin)
exports.getChefDetails = async (req, res) => {
    try {
        const chef = await User.findOne({ _id: req.params.id })
            .select('name email phone chefProfile createdAt');

        if (!chef) {
            return res.status(404).json({ success: false, message: 'Chef not found' });
        }

        // Get chef's menu
        const menu = await Food.find({ chef: chef._id, foodType: 'home' })
            .select('name price isAvailable isVeg isSpecial ingredients category preparationTime');

        // Get chef's order stats
        const totalOrders = await Order.countDocuments({ chef: chef._id });
        const deliveredOrders = await Order.countDocuments({ chef: chef._id, status: 'DELIVERED' });
        const cancelledOrders = await Order.countDocuments({ chef: chef._id, status: 'CANCELLED' });

        const revenueAgg = await Order.aggregate([
            { $match: { chef: chef._id, status: 'DELIVERED' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        // Recent orders
        const recentOrders = await Order.find({ chef: chef._id })
            .populate('user', 'name')
            .populate('items.food', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                chef,
                menu,
                stats: {
                    totalOrders,
                    deliveredOrders,
                    cancelledOrders,
                    totalRevenue,
                    platformEarnings: Math.round(totalRevenue * 0.15)
                },
                recentOrders,
                payoutHistory: chef.chefProfile?.payoutHistory || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all chef orders (Admin view)
// @route   GET /api/super-admin/chef/:id/orders
// @access  Private (Super Admin)
exports.getChefOrdersAdmin = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { chef: req.params.id };
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .populate('items.food', 'name price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Manage Chef Payout (Approve/Reject)
// @route   PUT /api/super-admin/chef/:id/payout/:payoutId
// @access  Private (Super Admin)
exports.manageChefPayout = async (req, res) => {
    try {
        const { action } = req.body; // 'completed' or 'rejected'
        const { id: chefId, payoutId } = req.params;

        if (!['completed', 'rejected'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Use completed or rejected.' });
        }

        const chef = await User.findById(chefId);
        if (!chef) {
            return res.status(404).json({ success: false, message: 'Chef not found' });
        }

        const payout = chef.chefProfile.payoutHistory.id(payoutId);
        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }
        if (payout.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Payout already processed' });
        }

        payout.status = action;
        if (action === 'completed') {
            payout.completedAt = new Date();
        } else if (action === 'rejected') {
            // Refund wallet balance
            chef.chefProfile.walletBalance = (chef.chefProfile.walletBalance || 0) + payout.amount;
        }

        await chef.save();

        res.json({
            success: true,
            message: `Payout ${action} successfully`,
            data: payout
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a chef's dish (Admin)
// @route   DELETE /api/super-admin/food/:id
// @access  Private (Super Admin)
exports.deleteChefFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }
        await Food.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Dish deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all pending payouts across all chefs
// @route   GET /api/super-admin/payouts
// @access  Private (Super Admin)
exports.getAllPendingPayouts = async (req, res) => {
    try {
        const chefs = await User.find({
            'chefProfile.payoutHistory.status': 'pending'
        }).select('name email chefProfile.payoutHistory chefProfile.walletBalance');

        const pendingPayouts = [];
        chefs.forEach(chef => {
            chef.chefProfile?.payoutHistory?.forEach(p => {
                if (p.status === 'pending') {
                    pendingPayouts.push({
                        chefId: chef._id,
                        chefName: chef.name,
                        chefEmail: chef.email,
                        payoutId: p._id,
                        amount: p.amount,
                        upiId: p.upiId,
                        requestedAt: p.requestedAt,
                        status: p.status
                    });
                }
            });
        });

        // Sort by most recent
        pendingPayouts.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        res.json({
            success: true,
            count: pendingPayouts.length,
            data: pendingPayouts
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create Home Chef (Admin)
// @route   POST /api/super-admin/chef
// @access  Private (Super Admin)
exports.createHomeChef = async (req, res) => {
    try {
        const { name, email, password, kitchenName, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with homeChef role and approved status
        const user = await User.create({
            name,
            email,
            password,
            phone: phone || '',
            role: 'homeChef',
            chefProfile: {
                kitchenName: kitchenName || `${name}'s Kitchen`,
                chefStatus: 'approved', // Auto-approve when created by Admin
                specialties: [],
                availability: { isAvailable: true }
            }
        });

        // Send welcome email (optional)
        /*
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to Foodie Home Kitchen! 🍳',
                message: `Hi ${user.name},\n\nYour Home Chef account has been created by the Administrator.\n\nA few things to get started:\n1. Login with your email: ${user.email}\n2. Go to your Chef Dashboard.\n3. Complete your profile and start adding dishes!\n\nWelcome aboard!\nThe Foodie Team`
            });
        } catch (err) {
            console.error('Email sending failed:', err);
        }
        */

        res.status(201).json({
            success: true,
            message: 'Home Chef created successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Home Chef/User (Admin)
// @route   DELETE /api/super-admin/chef/:id
// @access  Private (Super Admin)
exports.deleteHomeChef = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Delete associated foods, orders, etc.
        // For now, we'll just delete the user. MongoDB cascade or pre-remove hooks would be better for cleanup.
        await Food.deleteMany({ chef: user._id }); // Clean up their foods

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User and associated data deleted'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
