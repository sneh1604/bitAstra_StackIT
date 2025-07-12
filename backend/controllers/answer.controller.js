const Answer = require('../models/Answer.model');
const Question = require('../models/Question.model');
const User = require('../models/User.model');
const { createNotification } = require('../services/notification.service');

// @desc    Get answers for a question
// @route   GET /api/questions/:questionId/answers
// @access  Public
exports.getAnswers = async (req, res, next) => {
    try {
        const answers = await Answer.find({ question: req.params.questionId })
            .populate('author', 'username avatar reputation')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: answers.length,
            data: answers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add answer to question
// @route   POST /api/questions/:questionId/answers
// @access  Private
exports.addAnswer = async (req, res, next) => {
    try {
        req.body.question = req.params.questionId;
        req.body.author = req.user.id;

        const question = await Question.findById(req.params.questionId);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        const answer = await Answer.create(req.body);

        // Add answer to question
        question.answers.push(answer._id);
        await question.save();

        // Create notification for question author
        if (question.author.toString() !== req.user.id) {
            await createNotification({
                recipient: question.author,
                sender: req.user.id,
                type: 'answer',
                question: question._id,
                answer: answer._id
            });
        }

        res.status(201).json({
            success: true,
            data: answer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update answer
// @route   PUT /api/answers/:id
// @access  Private
exports.updateAnswer = async (req, res, next) => {
    try {
        let answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        // Make sure user is answer owner or admin
        if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this answer' });
        }

        answer = await Answer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: answer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
exports.deleteAnswer = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        // Make sure user is answer owner or admin
        if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this answer' });
        }

        // Remove answer from question
        await Question.findByIdAndUpdate(answer.question, {
            $pull: { answers: answer._id }
        });

        await answer.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept answer
// @route   PUT /api/answers/:id/accept
// @access  Private
exports.acceptAnswer = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        const question = await Question.findById(answer.question);

        // Make sure user is question owner
        if (question.author.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized to accept this answer' });
        }

        // Unaccept previously accepted answer if any
        if (question.acceptedAnswer) {
            await Answer.findByIdAndUpdate(question.acceptedAnswer, {
                isAccepted: false
            });
        }

        // Accept this answer
        answer.isAccepted = true;
        await answer.save();

        question.acceptedAnswer = answer._id;
        await question.save();

        // Create notification for answer author
        if (answer.author.toString() !== req.user.id) {
            await createNotification({
                recipient: answer.author,
                sender: req.user.id,
                type: 'accept',
                question: question._id,
                answer: answer._id
            });
        }

        res.status(200).json({
            success: true,
            data: answer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to answer
// @route   POST /api/answers/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        const comment = {
            text: req.body.text,
            author: req.user.id
        };

        answer.comments.push(comment);
        await answer.save();

        // Create notification for answer author if commenter is not the author
        if (answer.author.toString() !== req.user.id) {
            await createNotification({
                recipient: answer.author,
                sender: req.user.id,
                type: 'comment',
                question: answer.question,
                answer: answer._id,
                comment: req.body.text
            });
        }

        // Check for mentions (@username)
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        let mentions;
        while ((mentions = mentionRegex.exec(req.body.text)) !== null) {
            const mentionedUser = await User.findOne({ username: mentions[1] });
            if (mentionedUser && mentionedUser._id.toString() !== req.user.id) {
                await createNotification({
                    recipient: mentionedUser._id,
                    sender: req.user.id,
                    type: 'mention',
                    question: answer.question,
                    answer: answer._id,
                    comment: req.body.text
                });
            }
        }

        res.status(201).json({
            success: true,
            data: answer.comments
        });
    } catch (error) {
        next(error);
    }
};