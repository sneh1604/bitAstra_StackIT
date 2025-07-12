const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { createNotification } = require('../services/notification.service');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('questions')
            .populate('answers');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
    try {
        // Make sure user is the owner or admin
        if (req.params.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this user' });
        }

        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email,
            avatar: req.body.avatar
        };

        const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res, next) => {
    try {
        // Make sure user is the owner or admin
        if (req.params.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this user' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // TODO: Delete all user content (questions, answers, etc.)

        await user.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user notifications
// @route   GET /api/users/:id/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const notifications = await Notification.find({ recipient: req.params.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('sender', 'username avatar')
            .populate('question', 'title')
            .populate('answer');

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};