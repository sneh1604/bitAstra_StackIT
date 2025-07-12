const express = require('express');
const router = express.Router();
const {
    voteQuestion,
    voteAnswer
} = require('../controllers/vote.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/question/:id', protect, voteQuestion);
router.post('/answer/:id', protect, voteAnswer);

module.exports = router;