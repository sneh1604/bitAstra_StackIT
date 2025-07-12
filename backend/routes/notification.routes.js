const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createAdminNotification,
    getNotificationAnalytics
} = require('../controllers/notification.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, getNotifications);
router.put('/:id/mark-read', protect, markNotificationAsRead);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);

// Admin routes
router.post('/admin', protect, authorize('admin'), createAdminNotification);
router.get('/analytics', protect, authorize('admin'), getNotificationAnalytics);

module.exports = router;
