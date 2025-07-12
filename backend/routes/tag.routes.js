const express = require('express');
const router = express.Router();
const {
    getTags,
    getTag,
    followTag,
    createTag,
    updateTag
} = require('../controllers/tag.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', getTags);
router.get('/:id', getTag);
router.put('/:id/follow', protect, followTag);
router.post('/', protect, authorize('admin'), createTag);
router.put('/:id', protect, authorize('admin'), updateTag);

module.exports = router;