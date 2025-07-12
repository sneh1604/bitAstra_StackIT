const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    handleReport,
    dismissReport
} = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, createReport);
router.get('/', protect, authorize('admin'), getReports);
router.put('/:id/handle', protect, authorize('admin'), handleReport);
router.put('/:id/dismiss', protect, authorize('admin'), dismissReport);

module.exports = router;