const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, getNotifications);
router.put('/:id/mark-read', protect, markNotificationAsRead);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);

module.exports = router;