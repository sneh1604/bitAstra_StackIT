const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserQuestions,
    getUserAnswers
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', getUsers);
router.get('/:id', getUser);
router.get('/:id/questions', getUserQuestions);
router.get('/:id/answers', getUserAnswers);
router.put('/:id', protect, upload.single('avatar'), updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;