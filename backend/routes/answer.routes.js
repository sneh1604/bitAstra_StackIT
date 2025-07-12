const express = require('express');
const router = express.Router();
const {
    getAnswers,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    acceptAnswer,
    addComment
} = require('../controllers/answer.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/:questionId/answers', getAnswers);
router.post('/:questionId/answers', protect, addAnswer);
router.put('/:id', protect, updateAnswer);
router.delete('/:id', protect, deleteAnswer);
router.put('/:id/accept', protect, acceptAnswer);
router.post('/:id/comments', protect, addComment);

module.exports = router;