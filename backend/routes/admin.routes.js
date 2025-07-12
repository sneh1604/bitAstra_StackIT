const express = require('express');
const router = express.Router();
const {
    getUsers,
    banUser,
    deleteQuestion,
    deleteAnswer,
    sendAnnouncement,
    getStats,
    getReports,
    resolveReport,
    dismissReport
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

// Reports routes
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.put('/reports/:id/dismiss', dismissReport);

module.exports = router;