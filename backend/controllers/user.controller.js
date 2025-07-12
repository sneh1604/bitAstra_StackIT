const User = require('../models/User.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const Notification = require('../models/Notification.model');
const { createNotification } = require('../services/notification.service');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

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

// @desc    Get user's questions
// @route   GET /api/users/:id/questions
// @access  Public
exports.getUserQuestions = async (req, res, next) => {
    try {
        const questions = await Question.find({ author: req.params.id })
            .populate('tags')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's answers
// @route   GET /api/users/:id/answers
// @access  Public
exports.getUserAnswers = async (req, res, next) => {
    try {
        const answers = await Answer.find({ author: req.params.id })
            .populate('question', 'title')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: answers.length,
            data: answers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Make sure user is updating their own profile or is admin
        if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this user' });
        }

        // Update avatar if uploaded
        if (req.file) {
            req.body.avatar = req.file.path;
        }

        user = await User.findByIdAndUpdate(req.params.id, req.body, {
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Make sure user is deleting their own account or is admin
        if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this user' });
        }

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