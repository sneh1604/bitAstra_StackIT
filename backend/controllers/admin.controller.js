const User = require('../models/User.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const Report = require('../models/Report.model');
const Vote = require('../models/Vote.model');
const Notification = require('../models/Notification.model');
const Tag = require('../models/Tag.model');
const { sendEmail } = require('../services/email.service');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
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

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Cannot ban other admins
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, error: 'Cannot ban other admins' });
        }

        user.banned = !user.banned;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete any question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        // Delete all answers and votes associated with this question
        await Answer.deleteMany({ question: question._id });
        await Vote.deleteMany({ question: question._id });

        await question.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete any answer
// @route   DELETE /api/admin/answers/:id
// @access  Private/Admin
exports.deleteAnswer = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        // Remove answer from question
        await Question.findByIdAndUpdate(answer.question, {
            $pull: { answers: answer._id }
        });

        await answer.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send platform announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
exports.sendAnnouncement = async (req, res, next) => {
    try {
        const { subject, message } = req.body;

        // Get all users except admins
        const users = await User.find({ role: 'user' }).select('email');

        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, error: 'No users found' });
        }

        const emails = users.map(user => user.email);

        try {
            await sendEmail({
                email: emails,
                subject,
                message
            });

            // Create notifications for all users
            await Notification.create(
                users.map(user => ({
                    recipient: user._id,
                    type: 'admin',
                    text: message
                }))
            );

            res.status(200).json({ success: true, data: 'Announcement sent' });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments();
        const questionsCount = await Question.countDocuments();
        const answersCount = await Answer.countDocuments();
        const tagsCount = await Tag.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                users: usersCount,
                questions: questionsCount,
                answers: answersCount,
                tags: tagsCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
    try {
        const reports = await Report.find()
            .populate('reporter', 'username avatar')
            .populate('reportedItem')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resolve report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
exports.resolveReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        report.status = 'resolved';
        report.handledAt = new Date();
        report.handledBy = req.user.id;
        await report.save();

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Dismiss report
// @route   PUT /api/admin/reports/:id/dismiss
// @access  Private/Admin
exports.dismissReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        report.status = 'dismissed';
        report.handledAt = new Date();
        report.handledBy = req.user.id;
        await report.save();

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};