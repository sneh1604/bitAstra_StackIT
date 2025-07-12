const express = require('express');
const router = express.Router();
const {
    getUser,
    updateUser,
    deleteUser,
    getUserNotifications
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/:id', getUser);
router.put('/:id', protect, upload.single('avatar'), updateUser);
router.delete('/:id', protect, deleteUser);
router.get('/:id/notifications', protect, getUserNotifications);

module.exports = router;