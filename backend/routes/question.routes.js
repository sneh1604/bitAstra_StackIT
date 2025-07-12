const express = require('express');
const router = express.Router();
const {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions
} = require('../controllers/question.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getQuestions);
router.get('/search', searchQuestions);
router.get('/:id', getQuestion);
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;