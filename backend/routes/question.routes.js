const express = require('express');
const router = express.Router();
const {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    createSampleQuestions
} = require('../controllers/question.controller');
const { protect } = require('../middlewares/auth.middleware');

// Test endpoint to check if API is working
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Questions API is working',
        timestamp: new Date().toISOString()
    });
});

router.get('/', getQuestions);
router.get('/search', searchQuestions);
router.get('/:id', getQuestion);
router.post('/', protect, createQuestion);
router.post('/sample', createSampleQuestions); // Add sample questions route
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;