const express = require('express');
const router = express.Router();
const {
    getUsers,
    banUser,
    deleteQuestion,
    deleteAnswer,
    sendAnnouncement,
    getStats
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/ban', banUser);
router.delete('/questions/:id', deleteQuestion);
router.delete('/answers/:id', deleteAnswer);
router.post('/announcements', sendAnnouncement);
router.get('/stats', getStats);

module.exports = router;