const NotificationService = require('../services/notification.service');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({
            recipient: req.user.id,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username avatar')
            .populate('question', 'title')
            .populate('answer');

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/mark-read
// @access  Private
exports.markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return next(new ErrorResponse('Notification not found', 404));
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllNotificationsAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create admin notification
// @route   POST /api/notifications/admin
// @access  Private (Admin only)
exports.createAdminNotification = async (req, res, next) => {
    try {
        const {
            recipients,
            title,
            message,
            priority = 'medium',
            expiresAt,
            sendToAll = false
        } = req.body;

        if (!title || !message) {
            return next(new ErrorResponse('Title and message are required', 400));
        }

        let notificationData = {
            sender: req.user.id,
            title,
            message,
            priority,
            type: 'admin'
        };

        if (expiresAt) {
            notificationData.expiresAt = new Date(expiresAt);
        }

        if (sendToAll) {
            const count = await NotificationService.createBulkNotification(notificationData);
            res.status(201).json({
                success: true,
                message: `Notification sent to ${count} users`,
                data: { count }
            });
        } else {
            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return next(new ErrorResponse('Recipients are required when not sending to all', 400));
            }

            const count = await NotificationService.createBulkNotification(notificationData, recipients);
            res.status(201).json({
                success: true,
                message: `Notification sent to ${count} users`,
                data: { count }
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get notification analytics (Admin only)
// @route   GET /api/notifications/analytics
// @access  Private (Admin only)
exports.getNotificationAnalytics = async (req, res, next) => {
    try {
        const analytics = await Notification.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unreadCount: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalNotifications = await Notification.countDocuments();
        const totalUnread = await Notification.countDocuments({ isRead: false });

        res.status(200).json({
            success: true,
            data: {
                total: totalNotifications,
                totalUnread,
                byType: analytics
            }
        });
    } catch (error) {
        next(error);
    }
};